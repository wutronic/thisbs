// Function to hide the visualizer effect
function hideLogoVisualizerEffect() {
  const effect = document.querySelector('.ai-visualizer-effect');
  if (effect) effect.classList.add('hidden');
}
// Function to show the visualizer effect
function showLogoVisualizerEffect() {
  const effect = document.querySelector('.ai-visualizer-effect');
  if (effect) effect.classList.remove('hidden');
} 