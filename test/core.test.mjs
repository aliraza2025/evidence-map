import test from 'node:test';
import assert from 'node:assert/strict';
import { SAMPLE_TRANSCRIPT, parseTranscript, mapEvidence, validateProject, rice, evidenceFor, validateAssist, toPrd } from '../public/core.js';
test('preserves exact source text and counts distinct participant labels', () => {
  const project = mapEvidence(SAMPLE_TRANSCRIPT);
  validateProject(project);
  assert.equal(project.sources.length, 9);
  const followup = project.opportunities.find(item => item.title.includes('follow-up'));
  assert.equal(evidenceFor(project, followup).participantCount, 2);
  for (const item of project.opportunities) for (const citation of item.citations) assert.equal(project.sources.find(source => source.id === citation.sourceId).text, citation.quote);
});
test('unknown evidence remains visible rather than disappearing', () => {
  const project = mapEvidence('P01 | We store buckets on the top shelf.');
  assert.equal(project.opportunities[0].title, 'Explore uncategorized evidence');
});
test('AI extraction rejects fabricated quotations and source IDs', () => {
  const project = mapEvidence(SAMPLE_TRANSCRIPT);
  const output = { opportunities: [project.opportunities[0]] };
  assert.equal(validateAssist(output, { text: SAMPLE_TRANSCRIPT }).mode, 'ollama');
  output.opportunities[0].citations[0].quote = 'I said something that is not in the interview.';
  assert.throws(() => validateAssist(output, { text: SAMPLE_TRANSCRIPT }));
  output.opportunities[0].citations[0] = { sourceId: 'unknown', quote: project.sources[0].text };
  assert.throws(() => validateAssist(output, { text: SAMPLE_TRANSCRIPT }));
});
test('invalid imports and invalid assumptions do not create convincing scores', () => {
  assert.throws(() => parseTranscript('no participant divider'));
  assert.throws(() => parseTranscript('P1 | '));
  assert.throws(() => rice({ reach: 10, impact: 1, confidence: 0.5, effort: 0 }));
  assert.throws(() => rice({ reach: 10, impact: 1, confidence: 1.1, effort: 2 }));
  assert.equal(rice({ reach: 10, impact: 1, confidence: 0.5, effort: 2 }), 2.5);
  const project = mapEvidence(SAMPLE_TRANSCRIPT);
  project.sources[1].id = project.sources[0].id;
  assert.throws(() => validateProject(project));
});
test('discovery export keeps assumptions and evidence qualifications', () => {
  const markdown = toPrd(mapEvidence(SAMPLE_TRANSCRIPT));
  assert.match(markdown, /placeholders/);
  assert.match(markdown, /Not reviewed/);
  assert.ok(markdown.includes('L001'));
});
