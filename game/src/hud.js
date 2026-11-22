// HUD renderer for Heist Game

export function drawHUD(ctx, state) {
  ctx.save();
  ctx.fillStyle = 'rgba(10, 15, 25, 0.85)';
  ctx.fillRect(0, 0, ctx.canvas.width, 50);

  ctx.strokeStyle = '#00ffcc';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 50);
  ctx.lineTo(ctx.canvas.width, 50);
  ctx.stroke();

  ctx.font = 'bold 16px monospace';
  ctx.fillStyle = '#00ffcc';

  // Level & Score
  ctx.fillText(`LEVEL: ${state.currentLevel + 1} / ${state.totalLevels}`, 20, 30);
  ctx.fillText(`SCORE: ${state.score}`, 220, 30);

  // Loot count
  ctx.fillText(`LOOT: ${state.lootCollected} / ${state.totalLoot}`, 380, 30);

  // Time remaining
  const timeStr = Math.max(0, Math.ceil(state.timeRemaining)).toString();
  ctx.fillStyle = state.timeRemaining < 15 ? '#ff3366' : '#00ffcc';
  ctx.fillText(`TIME: ${timeStr}s`, 550, 30);

  // Alarm Meter
  ctx.fillStyle = '#ffffff';
  ctx.fillText('ALARM:', 700, 30);
  
  const barX = 770;
  const barY = 15;
  const barWidth = 150;
  const barHeight = 20;

  ctx.fillStyle = '#222';
  ctx.fillRect(barX, barY, barWidth, barHeight);

  const fillWidth = (state.alarmMeter / 100) * barWidth;
  ctx.fillStyle = state.alarmMeter > 70 ? '#ff3366' : state.alarmMeter > 30 ? '#ffcc00' : '#00ffcc';
  ctx.fillRect(barX, barY, fillWidth, barHeight);

  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barWidth, barHeight);

  ctx.restore();
}
