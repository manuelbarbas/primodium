import { GameObjectComponent } from "../../../engine/types";

interface Circle {
  x: number;
  y: number;
  movingVertically: boolean;
  startTime: number;
}

const createCircle = (x: number, y: number, startTime: number): Circle => ({
  x,
  y,
  movingVertically: true,
  startTime,
});

export const createPath = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  speed = 1,
  circleCount = 1,
  circleRadius = 2
): GameObjectComponent<"Graphics"> => {
  const circles: Circle[] = [];

  const drawPath = (gameObject: Phaser.GameObjects.Graphics) => {
    gameObject.lineStyle(1, 0xffffff, 0.7);
    gameObject.moveTo(0, 0);
    gameObject.lineTo(0, endY - startY);
    gameObject.lineTo(endX - startX, endY - startY);
    gameObject.stroke();
  };

  const moveCircle = (circle: Circle, delta: number, currentTime: number) => {
    if (currentTime < circle.startTime) {
      return;
    }

    if (circle.movingVertically) {
      const direction = startY < endY ? 1 : -1;
      circle.y += direction * speed * delta;
      if (
        (direction === 1 && circle.y >= endY) ||
        (direction === -1 && circle.y <= endY)
      ) {
        circle.y = endY;
        circle.movingVertically = false;
      }
    } else {
      const direction = startX < endX ? 1 : -1;
      circle.x += direction * speed * delta;
      if (
        (direction === 1 && circle.x >= endX) ||
        (direction === -1 && circle.x <= endX)
      ) {
        circle.x = startX;
        circle.y = startY;
        circle.movingVertically = true;
      }
    }
  };

  const drawCircle = (
    gameObject: Phaser.GameObjects.Graphics,
    circle: Circle
  ) => {
    gameObject.fillStyle(0xffffff);
    gameObject.fillCircle(
      circle.x - gameObject.x,
      circle.y - gameObject.y,
      circleRadius
    );
    gameObject.setZ(300);
  };

  return {
    id: "path",
    //will be called on spawn
    once: (gameObject) => {
      gameObject.clear();

      //initialize circles if it has not been populated yet
      if (!circles.length) {
        const delay = 2000;
        for (let i = 0; i < circleCount; i++) {
          circles.push(createCircle(startX, startY, i * delay));
        }
      }

      gameObject.x = startX;
      gameObject.y = startY;

      drawPath(gameObject);
    },
    //will be called on game tick
    update: (gameObject, time, delta) => {
      gameObject.clear();
      drawPath(gameObject);

      // Update and draw each circle
      circles.forEach((circle) => {
        moveCircle(circle, delta / 1000, time);
        drawCircle(gameObject, circle);
      });
    },
  };
};
