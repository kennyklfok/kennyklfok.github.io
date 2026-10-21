// Local capture host for the actual extension webview. No remote AI requests.
window.acquireVsCodeApi = () => ({ postMessage(message) {
  if (!['explainCode', 'explainFile'].includes(message.command)) return;
  window.postMessage({command:'showExplanation', text:`Explanation:
This function selects the available parking lots and sorts them by distance, so the nearest option appears first.

Key lines:
- Line 2: Remove lots with no available spaces.
- Line 3: Sort the remaining lots by distance.
- Line 4: Return the closest available lot, or null when none are available.`, explanationType:'code'}, '*');
}});
window.addEventListener('DOMContentLoaded', () => {
  window.postMessage({command:'updateCode', code:`function findNearestParking(lots) {
  const available = lots.filter(lot => lot.spaces > 0);
  available.sort((a, b) => a.distance - b.distance);
  return available[0] ?? null;
}`, startLine:1, endLine:5}, '*');
});
