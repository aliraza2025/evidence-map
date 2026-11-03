import os,sys,json,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
os.environ.setdefault('HF_HOME',str(ROOT/'.model-cache'))
import torch
from transformers import AutoTokenizer,AutoModel
from pydantic import PrivateAttr
from llama_index.core import Document,VectorStoreIndex
from llama_index.core.embeddings import BaseEmbedding
torch.set_num_threads(2)

class LocalEmbedding(BaseEmbedding):
    _tokenizer=PrivateAttr()
    _model=PrivateAttr()
    def __init__(self):
        super().__init__(model_name='sentence-transformers/all-MiniLM-L6-v2')
        self._tokenizer=AutoTokenizer.from_pretrained(self.model_name)
        self._model=AutoModel.from_pretrained(self.model_name);self._model.eval()
    def _encode(self,text):
        values=self._tokenizer(text,return_tensors='pt',padding=True,truncation=True,max_length=256)
        with torch.no_grad():
            hidden=self._model(**values).last_hidden_state
            mask=values['attention_mask'].unsqueeze(-1)
            pooled=(hidden*mask).sum(1)/mask.sum(1).clamp(min=1)
            return torch.nn.functional.normalize(pooled,p=2,dim=1)[0].tolist()
    def _get_query_embedding(self,query):return self._encode(query)
    def _get_text_embedding(self,text):return self._encode(text)
    async def _aget_query_embedding(self,query):return self._encode(query)

def retrieve(payload):
    text=payload['text'];query=payload['query']
    if not isinstance(text,str) or len(text)>100000 or not isinstance(query,str) or not query.strip() or len(query)>1000:raise ValueError('Invalid transcript or query.')
    sources=[]
    for line in text.splitlines():
        if not line.strip():continue
        participant,separator,content=line.partition('|')
        if not separator or not content.strip():raise ValueError('Use Participant | observation lines.')
        sources.append({'id':f'L{len(sources)+1:03}','participant':participant.strip(),'text':content.strip()})
    if not 1<=len(sources)<=500:raise ValueError('Use 1–500 observations.')
    started=time.perf_counter()
    documents=[Document(text=source['text'],metadata={'sourceId':source['id'],'participant':source['participant']},excluded_embed_metadata_keys=['sourceId','participant']) for source in sources]
    index=VectorStoreIndex.from_documents(documents,embed_model=LocalEmbedding())
    results=index.as_retriever(similarity_top_k=min(3,len(sources))).retrieve(query)
    matches=[]
    for node in results:
        source=next(item for item in sources if item['id']==node.metadata['sourceId'])
        matches.append({'sourceId':source['id'],'participant':source['participant'],'quote':source['text'],'score':float(node.score)})
    return {'framework':'LlamaIndex','model':'sentence-transformers/all-MiniLM-L6-v2','matches':matches,'elapsedSeconds':round(time.perf_counter()-started,3),'limits':'Similarity ranking is not a truth score or proof that the evidence supports a hypothesis.'}

if __name__=='__main__':print(json.dumps(retrieve(json.load(sys.stdin))))
