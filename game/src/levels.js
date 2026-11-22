// Level definitions for Heist Game

import { Guard } from './guards.js';
import { SecurityCamera } from './cameras.js';

export function getLevels() {
  return [
    {
      name: "Level 1: The Lobby Vault",
      timeLimit: 60,
      playerStart: { x: 80, y: 500 },
      walls: [
        { x: 50, y: 100, w: 20, h: 420 },
        { x: 50, y: 100, w: 800, h: 20 },
        { x: 850, y: 100, w: 20, h: 420 },
        { x: 50, y: 520, w: 350, h: 20 },
        { x: 500, y: 520, w: 370, h: 20 },
        // Interior partitions
        { x: 250, y: 200, w: 20, h: 200 },
        { x: 600, y: 250, w: 20, h: 200 },
      ],
      loot: [
        { x: 200, y: 150, collected: false, value: 500 },
        { x: 750, y: 150, collected: false, value: 500 },
        { x: 450, y: 400, collected: false, value: 800 }
      ],
      vault: { x: 810, y: 450, w: 50, h: 50, cracked: false },
      exit: { x: 70, y: 470, w: 60, h: 50 },
      guards: [
        new Guard([
          { x: 300, y: 150 },
          { x: 550, y: 150 },
          { x: 550, y: 350 },
          { x: 300, y: 350 }
        ], 1.2)
      ],
      cameras: [
        new SecurityCamera(500, 120, 0, -Math.PI/4, Math.PI/4, 0.008)
      ]
    },
    {
      name: "Level 2: The Secure Wing",
      timeLimit: 50,
      playerStart: { x: 80, y: 500 },
      walls: [
        { x: 50, y: 80, w: 20, h: 460 },
        { x: 50, y: 80, w: 820, h: 20 },
        { x: 870, y: 80, w: 20, h: 460 },
        { x: 50, y: 540, w: 340, h: 20 },
        { x: 510, y: 540, w: 380, h: 20 },
        // Interior walls
        { x: 250, y: 180, w: 20, h: 250 },
        { x: 450, y: 250, w: 20, h: 220 },
        { x: 680, y: 150, w: 20, h: 250 }
      ],
      loot: [
        { x: 150, y: 120, collected: false, value: 600 },
        { x: 580, y: 120, collected: false, value: 700 },
        { x: 780, y: 480, collected: false, value: 900 },
        { x: 350, y: 350, collected: false, value: 800 }
      ],
      vault: { x: 820, y: 100, w: 50, h: 50, cracked: false },
      exit: { x: 70, y: 480, w: 60, h: 60 },
      guards: [
        new Guard([
          { x: 300, y: 120 },
          { x: 620, y: 120 },
          { x: 620, y: 450 },
          { x: 300, y: 450 }
        ], 1.5),
        new Guard([
          { x: 500, y: 200 },
          { x: 800, y: 200 },
          { x: 800, y: 400 },
          { x: 500, y: 400 }
        ], 1.4)
      ],
      cameras: [
        new SecurityCamera(260, 100, Math.PI/2, 0, Math.PI, 0.012),
        new SecurityCamera(690, 420, -Math.PI/2, -Math.PI, 0, 0.012)
      ]
    },
    {
      name: "Level 3: The Grand Reserve Vault",
      timeLimit: 45,
      playerStart: { x: 80, y: 500 },
      walls: [
        { x: 40, y: 60, w: 20, h: 500 },
        { x: 40, y: 60, w: 840, h: 20 },
        { x: 880, y: 60, w: 20, h: 500 },
        { x: 40, y: 560, w: 320, h: 20 },
        { x: 480, y: 560, w: 420, h: 20 },
        // Maze / Complex interior
        { x: 200, y: 160, w: 20, h: 300 },
        { x: 380, y: 100, w: 20, h: 320 },
        { x: 560, y: 200, w: 20, h: 300 },
        { x: 720, y: 120, w: 20, h: 280 }
      ],
      loot: [
        { x: 120, y: 100, collected: false, value: 800 },
        { x: 300, y: 500, collected: false, value: 1000 },
        { x: 480, y: 120, collected: false, value: 1200 },
        { x: 650, y: 480, collected: false, value: 1000 },
        { x: 820, y: 200, collected: false, value: 1500 }
      ],
      vault: { x: 820, y: 480, w: 50, h: 50, cracked: false },
      exit: { x: 60, y: 500, w: 60, h: 60 },
      guards: [
        new Guard([
          { x: 100, y: 120 },
          { x: 350, y: 120 },
          { x: 350, y: 450 },
          { x: 100, y: 450 }
        ], 1.8),
        new Guard([
          { x: 420, y: 200 },
          { x: 700, y: 200 },
          { x: 700, y: 500 },
          { x: 420, y: 500 }
        ], 1.8),
        new Guard([
          { x: 600, y: 100 },
          { x: 850, y: 100 },
          { x: 850, y: 350 },
          { x: 600, y: 350 }
        ], 1.6)
      ],
      cameras: [
        new SecurityCamera(210, 80, 0, -Math.PI/2, Math.PI/2, 0.015),
        new SecurityCamera(570, 80, 0, -Math.PI/2, Math.PI/2, 0.015),
        new SecurityCamera(730, 420, 0, -Math.PI/2, Math.PI/2, 0.015)
      ]
    }
  ];
}
