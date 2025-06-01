export default class Piece{
    constructor(color, position){
        this.color = color;
        this.position = position;
    }
   move(newPosition){
    this.position = newPosition;
   }
}