

import React, { Component } from 'react';
import { Icon } from 'react-icons-kit';
import { ic_fast_forward as icFastForward, ic_fast_rewind as icFastRewind } from 'react-icons-kit/md';
import { Node } from 'react';
import { I18n } from '../types';
import { addMinutes } from '../actions';

type addMinutesType = typeof addMinutes;

type Props = {
  addMinutes: number,
  children?: Node,
  actions: {
    addMinutes: addMinutesType
  },
  i18n: I18n,
  className: string
}

export default class AddMinutesButton extends Component<Props> {
  static defaultProps = {
    addMinutes: 10,
    i18n: {
      minutesCaption: 'min'
    },
    className: 'harmovis_button'
  }

  addMinutes(minutes: number) {
    this.props.actions.addMinutes(minutes);
  }

  render() {
    const { addMinutes, children, i18n, className } = this.props;

    return (
      <button onClick={this.addMinutes.bind(this, addMinutes)} className={className}>
        {children === undefined ?
          <span>{addMinutes > 0 ?
            <Icon icon={icFastForward} /> : <Icon icon={icFastRewind} />
          }&nbsp;{addMinutes}&nbsp;{i18n.minutesCaption}</span> :
          <span>{children}</span>
        }
      </button>
    );
  }
}