import { SAMPLE_TRANSCRIPT, mapEvidence, validateProject, evidenceFor, rice, toPrd } from './core.js';
import { el, download, showError, assist } from './shared.js';
const $ = id => document.getElementById(id);
let project = mapEvidence(SAMPLE_TRANSCRIPT);
let selected = project.opportunities[0].id;
$('transcript').value = SAMPLE_TRANSCRIPT;
function render() {
  validateProject(project);
  $('summary').replaceChildren(el('div', { className: 'metrics' }, ...[['Source lines', project.sources.length, 'Exact text retained'], ['Participant labels', new Set(project.sources.map(source => source.participant)).size, 'Not a representative sample'], ['Opportunities', project.opportunities.length, 'Tentative product hypotheses'], ['Reviewed', project.opportunities.filter(item => item.reviewed).length, 'Marked by the operator']].map(([label, value, note]) => el('div', { className: 'metric' }, el('span', {}, label), el('strong', {}, String(value)), el('small', {}, note)))));
  renderOpportunities();
  $('sources').replaceChildren(...project.sources.map(source => el('article', { className: 'source-line', id: `source-${source.id}`, tabIndex: -1 }, el('span', { className: 'mono' }, source.id), el('strong', {}, source.participant), el('p', {}, source.text))));
  $('error').hidden = true;
}
function renderOpportunities() {
  const sorted = [...project.opportunities].sort((a, b) => $('sort').value === 'rice' ? rice(b.assumptions) - rice(a.assumptions) : evidenceFor(project, b).participantCount - evidenceFor(project, a).participantCount);
  if (!project.opportunities.some(item => item.id === selected)) selected = sorted[0].id;
  $('opportunities').replaceChildren(...sorted.map(item => { const evidence = evidenceFor(project, item); return el('button', { className: `case ${selected === item.id ? 'selected' : ''}`, 'aria-pressed': String(selected === item.id), onclick: () => { selected = item.id; renderOpportunities(); } }, el('span', { className: 'case-id' }, `${item.id} / ${item.reviewed ? 'REVIEWED' : 'DRAFT'}`), el('strong', {}, item.title), el('small', {}, `${evidence.sourceCount} lines · ${evidence.participantCount} participant labels`), el('span', { className: 'score-pill' }, `RICE ${rice(item.assumptions).toFixed(1)}`)); }));
  const item = project.opportunities.find(row => row.id === selected);
  const evidence = evidenceFor(project, item);
  const score = el('output', { className: 'rice-score' }, rice(item.assumptions).toFixed(1));
  $('detail').replaceChildren(el('div', { className: 'eyebrow' }, 'TENTATIVE OPPORTUNITY'), el('h3', {}, item.title), el('label', {}, 'Working hypothesis', el('textarea', { value: item.hypothesis, rows: 3, maxLength: 5000, onchange: event => { if (!event.target.value.trim()) { event.target.value = item.hypothesis; return; } item.hypothesis = event.target.value; item.reviewed = false; renderOpportunities(); } })),
    el('h4', {}, 'Follow the evidence'), ...item.citations.map(citation => { const source = project.sources.find(row => row.id === citation.sourceId); return el('blockquote', {}, citation.quote, el('a', { href: `#source-${source.id}`, onclick: () => { requestAnimationFrame(() => $(`source-${source.id}`).focus()); } }, `${source.participant} · ${source.id} · exact quote ↗`)); }),
    el('p', { className: 'muted' }, `${evidence.participantCount} participant labels support these source lines. Review contradictory and missing evidence separately.`),
    el('div', { className: 'section-top' }, el('h4', {}, 'RICE / explicit assumptions'), score),
    el('p', { className: 'muted' }, 'Score = reach × impact × confidence ÷ effort. Defaults are placeholders; choose a consistent period and effort unit.'),
    el('div', { className: 'assumptions' }, ...[['reach', 'Reach / chosen period', 1], ['impact', 'Impact multiplier', 0.1], ['confidence', 'Confidence (0–1)', 0.05], ['effort', 'Effort / chosen unit', 0.1]].map(([key, label, step]) => el('label', {}, label, el('input', { type: 'number', value: item.assumptions[key], min: key === 'effort' ? 0.1 : 0, max: key === 'confidence' ? 1 : 1000000, step, onchange: event => { try { const next = { ...item.assumptions, [key]: Number(event.target.value) }; if (!event.target.value) throw new Error('Enter a numeric assumption.'); rice(next); item.assumptions = next; item.reviewed = false; renderOpportunities(); } catch (error) { event.target.value = item.assumptions[key]; showError(error); } } })))),
    el('button', { className: item.reviewed ? 'quiet' : 'primary', onclick: () => { item.reviewed = !item.reviewed; render(); } }, item.reviewed ? 'Reopen review' : 'Mark hypothesis & evidence reviewed'));
}
$('discovery-form').addEventListener('submit', async event => { event.preventDefault(); const button = $('map'); button.disabled = true; button.textContent = 'Mapping…'; try { const next = $('mode').value === 'ollama' ? await assist({ text: $('transcript').value }) : mapEvidence($('transcript').value); validateProject(next); project = next; render(); } catch (error) { showError(error); } finally { button.disabled = false; button.textContent = 'Map the evidence ↗'; } });
$('sample').onclick = () => { $('transcript').value = SAMPLE_TRANSCRIPT; project = mapEvidence(SAMPLE_TRANSCRIPT); render(); };
$('sort').addEventListener('change', renderOpportunities);
$('prd').onclick = () => download('discovery-brief.md', toPrd(project), 'text/markdown');
$('json').onclick = () => download('evidence-map-project.json', JSON.stringify(project, null, 2), 'application/json');
$('import').addEventListener('change', async event => { try { const file = event.target.files[0]; if (!file) return; if (file.size > 2_000_000) throw new Error('Choose a project smaller than 2 MB.'); const next = validateProject(JSON.parse(await file.text())); project = next; $('transcript').value = project.sources.map(source => `${source.participant} | ${source.text}`).join('\n'); render(); } catch (error) { showError(error); } finally { event.target.value = ''; } });
render();
