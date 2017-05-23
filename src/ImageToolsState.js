import {observable, computed} from 'mobx';

export default class ImageToolsState {
  id;
  @observable values;
  @observable gravity;
  @observable crop;
  @observable pixelCrop;
  @observable gravityStyle

  constructor(id, initialValues, initialGravity, initialCrop, initialGravityStyle) {
    this.id = id;
    this.values = initialValues;
    this.gravity = initialGravity;
    this.crop = initialCrop;
    this.gravityStyle = initialGravityStyle;
  }

  /*
  set id(id) {
    this.id = id;
  }

  set values(values) {
    this.values = values;
  }

  set gravity(gravity) {
    this.gravity = gravity;
  }

  set crop(crop) {
    this.crop = crop;
  }

  set pixelCrop(pixelCrop) {
    this.pixelCrop = pixelCrop;
  }

  set gravityStyle(gravityStyle) {
    this.gravityStyle = gravityStyle;
  }

  get id() {
    return this.id;
  }

  get crop() {
    return this.crop;
  }

  get values() {
    return this.values;
  }

  get pixelCrop() {
    return this.pixelCrop;
  }

  get gravityStyle() {
    return this.gravityStyle;
  }
  */

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
