import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { StoreState } from 'app/types';

import { initPanelState } from '../../panel/state/actions';
import { setPanelInstanceState } from '../../panel/state/reducers';
import { DashboardModel, PanelModel } from '../state';

import { LazyLoader } from './LazyLoader';
import { PanelChromeAngular } from './PanelChromeAngular';
import { PanelStateWrapper } from './PanelStateWrapper';

export interface OwnProps {
  panel: PanelModel;
  stateKey: string;
  dashboard: DashboardModel;
  isEditing: boolean;
  isViewing: boolean;
  isDraggable?: boolean;
  width: number;
  height: number;
  lazy?: boolean;
  timezone?: string;
  hideMenu?: boolean;
}

const mapStateToProps = (state: StoreState, props: OwnProps) => {
  const panelState = state.panels[props.stateKey];
  if (!panelState) {
    return { plugin: null };
  }

  return {
    plugin: panelState.plugin,
    instanceState: panelState.instanceState,
  };
};

const mapDispatchToProps = {
  initPanelState,
  setPanelInstanceState,
};

console.log('---- DashboardPannel connect start');
const connector = connect(mapStateToProps, mapDispatchToProps);
console.log('---- DashboardPannel connect stop');

export type Props = OwnProps & ConnectedProps<typeof connector>;

export class DashboardPanelUnconnected extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    lazy: true,
  };

  componentDidMount() {
    console.log('---- DashboardPannel componentDidMount');
    this.props.panel.isInView = !this.props.lazy;
    console.log({ lazy: this.props.lazy })
    if (!this.props.lazy) {
      this.onPanelLoad();
    }
  }

  onInstanceStateChange = (value: any) => {
    console.log('---- DashboardPanel onInstanceStateChange', { key: this.props.stateKey, value });
    this.props.setPanelInstanceState({ key: this.props.stateKey, value });
  };

  onVisibilityChange = (v: boolean) => {
    this.props.panel.isInView = v;
  };

  onPanelLoad = () => {
    if (!this.props.plugin) {
      console.log('---- onPanelLoad');
      this.props.initPanelState(this.props.panel);
    }
  };

  renderPanel = ({ isInView }: { isInView: boolean }) => {
    const {
      dashboard,
      panel,
      isViewing,
      isEditing,
      width,
      height,
      plugin,
      timezone,
      hideMenu,
      isDraggable = true,
    } = this.props;

    // console.log({
    //   dashboard,
    //   panel,
    //   isViewing,
    //   isEditing,
    //   width,
    //   height,
    //   plugin,
    //   timezone,
    //   hideMenu,
    //   isDraggable,
    //   angularPanelCtrl: plugin?.angularPanelCtrl,
    // });

    if (!plugin) {
      return null;
    }

    if (plugin && plugin.angularPanelCtrl) {
      return (
        <PanelChromeAngular
          plugin={plugin}
          panel={panel}
          dashboard={dashboard}
          isViewing={isViewing}
          isEditing={isEditing}
          isInView={isInView}
          isDraggable={isDraggable}
          width={width}
          height={height}
        />
      );
    }

    return (
      <PanelStateWrapper
        plugin={plugin}
        panel={panel}
        dashboard={dashboard}
        isViewing={isViewing}
        isEditing={isEditing}
        isInView={isInView}
        isDraggable={isDraggable}
        width={width}
        height={height}
        onInstanceStateChange={this.onInstanceStateChange}
        timezone={timezone}
        hideMenu={hideMenu}
      />
    );
  };

  render() {
    console.log('---- DashboardPannel render start');
    const { width, height, lazy, dashboard } = this.props;
    const panel = dashboard.panels[0];
    if (!(panel && panel.plugin)) {
      console.log('---- DashboardPannel render No plugin');
    }

    return lazy ? (
      <LazyLoader width={width} height={height} onChange={this.onVisibilityChange} onLoad={this.onPanelLoad}>
        {this.renderPanel}
      </LazyLoader>
    ) : (
      this.renderPanel({ isInView: true })
    );
  }
}

export const DashboardPanel = connector(DashboardPanelUnconnected);
