class StickerState {
  backgroundColor: string;
  host: string;
  dateTime: number;

  constructor(backgroundColor, host, dateTime) {
    this.backgroundColor = backgroundColor ?? '#F9F15A';
    this.host = host ?? 'Hosted By \n Balboa Park';
    this.dateTime = dateTime ?? Date.now();
  }
}

export default StickerState;
