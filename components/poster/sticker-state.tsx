class StickerState {
  backgroundColor: string;
  host: string;
  date: Date;

  constructor(backgroundColor: string, host: string, date: Date) {
    this.backgroundColor = backgroundColor ?? '#F9F15A';
    this.host = host ?? 'Hosted By \n SDDW';
    this.date = date ?? new Date();
  }
}

export default StickerState;
