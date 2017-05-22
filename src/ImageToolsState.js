import {observable, computed} from 'mobx';

export default class ImageToolsState {
  // id;
  // @observable values;
  // @observable gravity;
  // @observable crop;

  constructor(id, initialValues, initialGravity, initialCrop) {
    this.id = id;
    @observable this.values = initialValues;
    @observable this.gravity = initialGravity;
    @observable this.crop = initialCrop;
  }

  @computed get imageStyle() {
    // return imageStyle
  }

  @computed get editSpec() {
    // return editSpec
  }

  @computed get gravityStyle() {
    // return gravityStyle
  }
}
