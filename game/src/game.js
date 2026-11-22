// Main game loop and controller for Stealth Heist

import { getLevels } from './levels.js';
import { drawHUD } from './hud.js';
import { playSound } from './audio.js';

export class HeistGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.levels = getLevels();
    this.currentLevel = 0;
    this.score = 0;
    this.state = 'START'; // START, PLAYING, CRACKING, GAMEOVER, LEVELWIN, FINALWIN
    
    this.player = {
      x: 100,
      y: 500,
      radius: 12,
      speed: 3.2,
      angle: 0
    };

    this.keys = {};
    this.mouse = { x: 0, y: 0, clicked: false };

    this.alarmMeter = 0; // 0 to 100
    this.lootCollected = 0;
    this.totalLoot = 0;
    this.timeRemaining = 60;
    this.levelData = null;

    this.setupListeners();
    this.loadLevel(0);
  }

  setupListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      if (e.code === 'Space' && this.state === 'START') {
        this.startGame();
      }
      if (e.code === 'KeyR' && (this.state === 'GAMEOVER' || this.state === 'FINALWIN')) {
        this.restartGame();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('click', () => {
      if (this.state === 'START') {
        this.startGame();
      } else if (this.state === 'GAMEOVER' || this.state === 'FINALWIN') {
        this.restartGame();
      } else if (this.state === 'LEVELWIN') {
        this.nextLevel();
      }
    });
  }

  startGame() {
    playSound('loot');
    this.currentLevel = 0;
    this.score = 0;
    this.loadLevel(this.currentLevel);
    this.state = 'PLAYING';
  }

  restartGame() {
    playSound('loot');
    this.currentLevel = 0;
    this.score = 0;
    this.loadLevel(this.currentLevel);
    this.state = 'PLAYING';
  }

  nextLevel() {
    this.currentLevel++;
    if (this.currentLevel >= this.levels.length) {
      this.state = 'FINALWIN';
      playSound('win');
    } else {
      this.loadLevel(this.currentLevel);
      this.state = 'PLAYING';
    }
  }

  loadLevel(idx) {
    const lvl = this.levels[idx];
    this.levelData = JSON.parse(JSON.stringify(lvl));
    // Re-instantiate class objects for guards and cameras
    this.levelData.guards = lvl.guards;
    this.levelData.cameras = lvl.cameras;

    this.player.x = lvl.playerStart.x;
    this.player.y = lvl.playerStart.y;
    this.timeRemaining = lvl.timeLimit;
    this.lootCollected = 0;
    this.totalLoot = lvl.loot.length;
    this.alarmMeter = 0;
  }

  update(dt) {
    if (this.state !== 'PLAYING') return;

    // Timer countdown
    this.timeRemaining -= dt;
    if (this.timeRemaining <= 0) {
      this.gameOver("TIME EXPIRED!");
      return;
    }

    // Player movement
    let dx = 0;
    let dy = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;

      this.player.angle = Math.atan2(dy, dx);

      // Move with wall collision
      const newX = this.player.x + dx * this.player.speed;
      const newY = this.player.y + dy * this.player.speed;

      if (!this.checkWallCollision(newX, this.player.y)) {
        this.player.x = newX;
      }
      if (!this.checkWallCollision(this.player.x, newY)) {
        this.player.y = newY;
      }

      if (Math.random() < 0.1) {
        playSound('footstep');
      }
    }

    // Update guards
    let detected = false;
    for (const guard of this.levelData.guards) {
      guard.update(dt, this.levelData.walls);
      if (guard.canSeePlayer(this.player, this.levelData.walls)) {
        detected = true;
      }
    }

    // Update cameras
    for (const cam of this.levelData.cameras) {
      cam.update(dt);
      if (cam.canSeePlayer(this.player, this.levelData.walls)) {
        detected = true;
      }
    }

    if (detected) {
      this.alarmMeter += dt * 45; // fills up in ~2.2 seconds of continuous view
      if (Math.random() < 0.2) playSound('alarm');
      if (this.alarmMeter >= 100) {
        this.gameOver("CAUGHT BY SECURITY!");
        return;
      }
    } else {
      this.alarmMeter = Math.max(0, this.alarmMeter - dt * 20);
    }

    // Check loot collection
    for (const item of this.levelData.loot) {
      if (!item.collected) {
        const dist = Math.hypot(this.player.x - item.x, this.player.y - item.y);
        if (dist < this.player.radius + 15) {
          item.collected = true;
          this.lootCollected++;
          this.score += item.value;
          playSound('loot');
        }
      }
    }

    // Check vault interaction
    const vault = this.levelData.vault;
    const distVault = Math.hypot(this.player.x - (vault.x + vault.w/2), this.player.y - (vault.y + vault.h/2));
    if (!vault.cracked && distVault < 40) {
      if (this.keys['Space']) {
        vault.cracked = true;
        this.score += 1500;
        playSound('crack');
      }
    }

    // Check exit condition
    const exit = this.levelData.exit;
    const inExit = this.player.x >= exit.x && this.player.x <= exit.x + exit.w &&
                   this.player.y >= exit.y && this.player.y <= exit.y + exit.h;

    if (inExit) {
      if (vault.cracked) {
        // Level complete!
        const timeBonus = Math.floor(this.timeRemaining * 20);
        this.score += timeBonus;
        this.state = 'LEVELWIN';
        playSound('win');
      }
    }
  }

  checkWallCollision(x, y) {
    const r = this.player.radius;
    for (const wall of this.levelData.walls) {
      if (
        x + r > wall.x &&
        x - r < wall.x + wall.w &&
        y + r > wall.y &&
        y - r < wall.y + wall.h
      ) {
        return true;
      }
    }
    // Canvas boundary check
    if (x - r < 0 || x + r > this.canvas.width || y - r < 50 || y + r > this.canvas.height) {
      return true;
    }
    return false;
  }

  gameOver(reason) {
    this.state = 'GAMEOVER';
    this.gameOverReason = reason;
    playSound('gameover');
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.state === 'START') {
      this.drawStartScreen();
      return;
    }

    // Draw Vault Bank Floor background
    this.ctx.fillStyle = '#0d131f';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Floor grid pattern
    this.ctx.strokeStyle = '#152238';
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.canvas.width; x += 40) {
      this.ctx.beginPath(); this.ctx.moveTo(x, 50); this.ctx.lineTo(x, this.canvas.height); this.ctx.stroke();
    }
    for (let y = 50; y < this.canvas.height; y += 40) {
      this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(this.canvas.width, y); this.ctx.stroke();
    }

    if (this.levelData) {
      // Draw Exit Zone
      const exit = this.levelData.exit;
      this.ctx.fillStyle = this.levelData.vault.cracked ? 'rgba(0, 255, 204, 0.3)' : 'rgba(100, 100, 100, 0.2)';
      this.ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
      this.ctx.strokeStyle = '#00ffcc';
      this.ctx.setLineDash([4, 4]);
      this.ctx.strokeRect(exit.x, exit.y, exit.w, exit.h);
      this.ctx.setLineDash([]);
      this.ctx.fillStyle = '#00ffcc';
      this.ctx.font = '12px monospace';
      this.ctx.fillText('EXIT', exit.x + 15, exit.y + 30);

      // Draw Vault
      const vault = this.levelData.vault;
      this.ctx.fillStyle = vault.cracked ? '#114433' : '#334455';
      this.ctx.fillRect(vault.x, vault.y, vault.w, vault.h);
      this.ctx.strokeStyle = vault.cracked ? '#00ffcc' : '#ffcc00';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(vault.x, vault.y, vault.w, vault.h);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 12px monospace';
      this.ctx.fillText(vault.cracked ? 'OPEN' : 'VAULT', vault.x + 5, vault.y + 30);

      // Draw Loot Bags
      for (const item of this.levelData.loot) {
        if (!item.collected) {
          this.ctx.fillStyle = '#ffcc00';
          this.ctx.beginPath();
          this.ctx.arc(item.x, item.y, 8, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.strokeStyle = '#fff';
          this.ctx.lineWidth = 2;
          this.ctx.stroke();
          // dollar sign
          this.ctx.fillStyle = '#000';
          this.ctx.font = 'bold 10px monospace';
          this.ctx.fillText('$', item.x - 3, item.y + 4);
        }
      }

      // Draw Walls
      for (const wall of this.levelData.walls) {
        this.ctx.fillStyle = '#1e293b';
        this.ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
        this.ctx.strokeStyle = '#334155';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
      }

      // Draw Guards
      for (const guard of this.levelData.guards) {
        guard.draw(this.ctx);
      }

      // Draw Cameras
      for (const cam of this.levelData.cameras) {
        cam.draw(this.ctx);
      }

      // Draw Player
      this.ctx.save();
      this.ctx.fillStyle = '#00ffcc';
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Player facing direction
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(this.player.x, this.player.y);
      this.ctx.lineTo(
        this.player.x + Math.cos(this.player.angle) * 18,
        this.player.y + Math.sin(this.player.angle) * 18
      );
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Draw HUD
    drawHUD(this.ctx, {
      currentLevel: this.currentLevel,
      totalLevels: this.levels.length,
      score: this.score,
      lootCollected: this.lootCollected,
      totalLoot: this.totalLoot,
      timeRemaining: this.timeRemaining,
      alarmMeter: this.alarmMeter
    });

    // Overlays
    if (this.state === 'GAMEOVER') {
      this.drawOverlay("MISSION FAILED", this.gameOverReason, "Press R or Click to Restart", "#ff3366");
    } else if (this.state === 'LEVELWIN') {
      this.drawOverlay("LEVEL CLEARED!", `Score: ${this.score}`, "Click or Press Enter for Next Level", "#00ffcc");
    } else if (this.state === 'FINALWIN') {
      this.drawOverlay("GRAND HEIST SUCCESSFUL!", `Final Score: ${this.score}`, "Press R or Click to Play Again", "#00ffcc");
    }
  }

  drawStartScreen() {
    this.ctx.fillStyle = '#090d16';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Title decorative background grid
    this.ctx.strokeStyle = '#152238';
    for (let x = 0; x < this.canvas.width; x += 50) {
      this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, this.canvas.height); this.ctx.stroke();
    }

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#00ffcc';
    this.ctx.font = 'bold 42px monospace';
    this.ctx.fillText("CYBER HEIST: VAULT BREAKER", this.canvas.width / 2, 180);

    this.ctx.fillStyle = '#94a3b8';
    this.ctx.font = '18px monospace';
    this.ctx.fillText("Infiltrate the high-security bank, avoid guard vision cones & cameras,", this.canvas.width / 2, 240);
    this.ctx.fillText("grab loot bags, crack the vault, and escape before time runs out!", this.canvas.width / 2, 275);

    // Instructions box
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    this.ctx.strokeStyle = '#00ffcc';
    this.ctx.lineWidth = 2;
    this.ctx.fillRect(this.canvas.width / 2 - 300, 320, 600, 180);
    this.ctx.strokeRect(this.canvas.width / 2 - 300, 320, 600, 180);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 16px monospace';
    this.ctx.fillText("CONTROLS:", this.canvas.width / 2, 355);
    this.ctx.font = '14px monospace';
    this.ctx.fillText("Move: WASD or Arrow Keys", this.canvas.width / 2, 385);
    this.ctx.fillText("Crack Vault: Stand close to Vault & Press [SPACE]", this.canvas.width / 2, 415);
    this.ctx.fillText("Escape: Reach EXIT zone after cracking vault", this.canvas.width / 2, 445);

    this.ctx.fillStyle = '#00ffcc';
    this.ctx.font = 'bold 20px monospace';
    this.ctx.fillText("CLICK OR PRESS SPACE TO START", this.canvas.width / 2, 550);
    this.ctx.textAlign = 'left';
  }

  drawOverlay(title, subtitle, prompt, color) {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(5, 8, 15, 0.85)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = color;
    this.ctx.font = 'bold 40px monospace';
    this.ctx.fillText(title, this.canvas.width / 2, this.canvas.height / 2 - 50);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '22px monospace';
    this.ctx.fillText(subtitle, this.canvas.width / 2, this.canvas.height / 2 + 10);

    this.ctx.fillStyle = '#00ffcc';
    this.ctx.font = '16px monospace';
    this.ctx.fillText(prompt, this.canvas.width / 2, this.canvas.height / 2 + 70);
    this.ctx.restore();
  }
}
