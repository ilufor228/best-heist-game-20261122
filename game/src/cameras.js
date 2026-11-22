// Security cameras with rotating vision cones

export class SecurityCamera {
  constructor(x, y, startAngle, minAngle, maxAngle, rotationSpeed = 0.01) {
    this.x = x;
    this.y = y;
    this.angle = startAngle;
    this.minAngle = minAngle;
    this.maxAngle = maxAngle;
    this.rotationSpeed = rotationSpeed;
    this.visionRange = 160;
    this.visionAngle = Math.PI / 4; // 45 degrees
  }

  update(dt) {
    this.angle += this.rotationSpeed;
    if (this.angle > this.maxAngle || this.angle < this.minAngle) {
      this.rotationSpeed = -this.rotationSpeed;
      this.angle += this.rotationSpeed;
    }
  }

  canSeePlayer(player, walls) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > this.visionRange) return false;

    const angleToPlayer = Math.atan2(dy, dx);
    let angleDiff = angleToPlayer - this.angle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    if (Math.abs(angleDiff) > this.visionAngle / 2) return false;

    for (const wall of walls) {
      if (lineIntersectsRect(this.x, this.y, player.x, player.y, wall)) {
        return false;
      }
    }

    return true;
  }

  draw(ctx) {
    ctx.save();
    // Draw camera vision cone
    ctx.fillStyle = 'rgba(255, 200, 50, 0.12)';
    ctx.strokeStyle = 'rgba(255, 200, 50, 0.35)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    const leftAngle = this.angle - this.visionAngle / 2;
    const rightAngle = this.angle + this.visionAngle / 2;
    ctx.arc(this.x, this.y, this.visionRange, leftAngle, rightAngle);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw camera housing
    ctx.fillStyle = '#ffaa00';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Lens facing
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + Math.cos(this.angle) * 14, this.y + Math.sin(this.angle) * 14);
    ctx.stroke();

    ctx.restore();
  }
}

function lineIntersectsRect(x1, y1, x2, y2, rect) {
  const rx1 = rect.x;
  const ry1 = rect.y;
  const rx2 = rect.x + rect.w;
  const ry2 = rect.y + rect.h;

  return (
    lineIntersect(x1, y1, x2, y2, rx1, ry1, rx2, ry1) ||
    lineIntersect(x1, y1, x2, y2, rx2, ry1, rx2, ry2) ||
    lineIntersect(x1, y1, x2, y2, rx1, ry2, rx2, ry2) ||
    lineIntersect(x1, y1, x2, y2, rx1, ry1, rx1, ry2)
  );
}

function lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denom === 0) return false;
  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}
