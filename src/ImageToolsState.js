import {observable, computed} from 'mobx';

export default class ImageToolsState {
  id;
  @observable values;
  @observable gravity;
  @observable crop;

  constructor(id, values, gravity, crop) {

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
