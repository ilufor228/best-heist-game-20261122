// Guard management and vision cone detection

export class Guard {
  constructor(patrolPoints, speed = 1.5) {
    this.patrolPoints = patrolPoints; // Array of {x, y}
    this.currentPointIdx = 0;
    this.x = patrolPoints[0].x;
    this.y = patrolPoints[0].y;
    this.speed = speed;
    this.angle = 0; // facing angle
    this.visionRange = 140;
    this.visionAngle = Math.PI / 3; // 60 degrees
    this.state = 'patrol'; // patrol, alert
    this.alertTimer = 0;
  }

  update(dt, walls) {
    const target = this.patrolPoints[this.currentPointIdx];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 3) {
      this.currentPointIdx = (this.currentPointIdx + 1) % this.patrolPoints.length;
    } else {
      const moveDist = this.speed;
      this.angle = Math.atan2(dy, dx);
      this.x += (dx / dist) * Math.min(dist, moveDist);
      this.y += (dy / dist) * Math.min(dist, moveDist);
    }
  }

  canSeePlayer(player, walls) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > this.visionRange) return false;

    const angleToPlayer = Math.atan2(dy, dx);
    let angleDiff = angleToPlayer - this.angle;
    // Normalize angle diff to [-PI, PI]
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    if (Math.abs(angleDiff) > this.visionAngle / 2) return false;

    // Check line of sight against walls
    for (const wall of walls) {
      if (lineIntersectsRect(this.x, this.y, player.x, player.y, wall)) {
        return false;
      }
    }

    return true;
  }

  draw(ctx) {
    ctx.save();
    // Draw vision cone
    ctx.fillStyle = 'rgba(255, 50, 50, 0.15)';
    ctx.strokeStyle = 'rgba(255, 50, 50, 0.4)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    const leftAngle = this.angle - this.visionAngle / 2;
    const rightAngle = this.angle + this.visionAngle / 2;
    ctx.arc(this.x, this.y, this.visionRange, leftAngle, rightAngle);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw guard body
    ctx.fillStyle = '#ff3366';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Direction indicator
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + Math.cos(this.angle) * 16, this.y + Math.sin(this.angle) * 16);
    ctx.stroke();

    ctx.restore();
  }
}

function lineIntersectsRect(x1, y1, x2, y2, rect) {
  // rect: {x, y, w, h}
  const rx1 = rect.x;
  const ry1 = rect.y;
  const rx2 = rect.x + rect.w;
  const ry2 = rect.y + rect.h;

  // Check intersection with 4 sides of rect
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
  const ua =rogueVal((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3), denom);
  const ub = rogueVal((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3), denom);
  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

function rogueVal(num, denom) {
  return num / denom;
}
