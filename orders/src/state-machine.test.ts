import {StateMachine} from './state-machine';

test('empty state machine', () => {
  const stateMachine = new StateMachine([]);
  expect(stateMachine.getNextState('A', 'a')).toBeNull();
  expect(stateMachine.getPossibleStates('a')).toEqual([]);
});

test('simple state machine', () => {
  const stateMachine = new StateMachine([['a', [['A', 'B']]]]);
  expect(stateMachine.getNextState('A', 'a')).toEqual('B');
  expect(stateMachine.getNextState('B', 'a')).toBeNull();
  expect(stateMachine.getPossibleStates('a')).toEqual([['A', 'B']]);
});
