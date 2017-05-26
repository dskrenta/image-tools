import {observable, computed} from 'mobx';

export default class ImageToolsState {
  id;
  @observable values;
  @observable gravity;
  @observable crop;
  @observable pixelCrop;
  @observable gravityStyle;

  constructor(id, initialValues, initialGravity, initialCrop, initialGravityStyle) {
    this.id = id;
    this.values = initialValues;
    this.gravity = initialGravity;
    this.crop = initialCrop;
    this.gravityStyle = initialGravityStyle;
  }

  @computed get imageStyle() {
    return {
      filter: `brightness(${this.values.brt}%) ` +
      `saturate(${this.values.sat}%) ` +
      `contrast(${100 + parseInt(this.values.con, 10)}%)`
    };
  }

  @computed get editSpec() {
    return `brt${this.values.brt}` +
    `-sat${this.values.sat}` +
    `-con${this.values.con}x${100 - this.values.con}`;
  }

  @computed get finalSpec() {

  }
}
