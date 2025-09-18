import type { Vector2D } from "./Vector2D";

export type ObstacleData = {
    id: number; // Unique identifier for the obstacle
    position: Vector2D; //X,Z position, the Y is always 0
    size: number;
}