import { Chessground } from 'chessground';
import { makeConfig as makeCgConfig } from 'puz/view/chessground';
import renderClock from 'puz/view/clock';
import RacerCtrl from '../ctrl';
import { playModifiers, renderCombo, renderSolved } from 'puz/view/util';
import { h } from 'snabbdom';
import { VNode } from 'snabbdom/vnode';
import { makeCgOpts } from 'puz/run';
import { renderRace } from './race';
import { bind } from 'puz/util';
import { INITIAL_BOARD_FEN } from 'chessops/fen';

export default function (ctrl: RacerCtrl): VNode {
  return h(
    'div.racer.racer-app.racer--play',
    {
      class: playModifiers(ctrl.run),
    },
    renderPlay(ctrl)
  );
}

const chessground = (ctrl: RacerCtrl): VNode =>
  h('div.cg-wrap', {
    hook: {
      insert: vnode =>
        ctrl.ground(
          Chessground(
            vnode.elm as HTMLElement,
            makeCgConfig(
              ctrl.isRacing()
                ? makeCgOpts(ctrl.run, ctrl.isRacing())
                : {
                    fen: INITIAL_BOARD_FEN,
                    orientation: ctrl.run.pov,
                    movable: { color: ctrl.run.pov },
                  },
              ctrl.pref,
              ctrl.userMove
            )
          )
        ),
      destroy: _ => ctrl.withGround(g => g.destroy()),
    },
  });

const renderPlay = (ctrl: RacerCtrl): VNode[] => [
  renderRace(ctrl),
  h('div.puz-board.main-board', [
    chessground(ctrl),
    ctrl.promotion.view(),
    ctrl.countdownSeconds() ? renderCountdown(ctrl.countdownSeconds()) : undefined,
  ]),
  h('div.puz-side', [
    ctrl.run.clock.startAt ? renderSolved(ctrl.run) : renderStart(),
    ctrl.isPlayer() ? renderClock(ctrl.run, ctrl.endNow) : renderJoin(ctrl),
    h('div.puz-side__table', [renderCombo(ctrl.run)]),
  ]),
];

const renderCountdown = (seconds: number) =>
  h('div.racer__countdown', [
    h('div.racer__countdown__lights', [
      h('light.red', {
        class: { active: seconds > 4 },
      }),
      h('light.orange', {
        class: { active: seconds == 3 || seconds == 4 },
      }),
      h('light.green', {
        class: { active: seconds <= 2 },
      }),
    ]),
    h('div.racer__countdown__seconds', seconds),
  ]);

const renderJoin = (ctrl: RacerCtrl) =>
  ctrl.canJoin()
    ? h(
        'div.puz-side__join',
        h(
          'button.button.button-fat',
          {
            hook: bind('click', ctrl.join),
          },
          'Join the race!'
        )
      )
    : undefined;

const renderStart = () =>
  h(
    'div.puz-side__top.puz-side__start',
    h('div.puz-side__start__text', [h('strong', 'Puzzle Racer'), h('span', 'Waiting to start')])
  );
