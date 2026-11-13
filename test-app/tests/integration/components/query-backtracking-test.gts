import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import Component from '@glimmer/component';
import type { TOC } from '@ember/component/template-only';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import { useQuery, gql } from 'glimmer-apollo';

import type {
  UserInfoQuery,
  UserInfoQueryVariables,
} from 'test-app/mocks/handlers';

const USER_INFO = gql`
  query UserInfo($id: ID!) {
    user(id: $id) {
      id
      firstName
      lastName
    }
  }
`;

class Toggle {
  @tracked showSecond = false;
}

type QueryResult = ReturnType<
  typeof useQuery<UserInfoQuery, UserInfoQueryVariables>
>;

/**
 * Stands in for a presentational wrapper that branches on the query's state,
 * the way an app-level <Query> component does.
 */
const QueryView: TOC<{ Args: { query: QueryResult } }> = <template>
  {{#if @query.loading}}
    <div data-test-id="loading">Loading</div>
  {{else}}
    <div data-test-id="name">{{@query.data.user.firstName}}</div>
  {{/if}}
</template>;

/**
 * The documented way to stop polling once the data arrives: read the interval
 * from tracked state in the options thunk, and clear it from `onComplete` once
 * the data is actually there -- which means `onComplete` reads back from the
 * very resource that is being set up.
 */
class Poller extends Component {
  // Long enough that a poll never actually fires during the test; the
  // point is only that the thunk reads it and onComplete clears it.
  @tracked pollInterval = 100000;

  query = useQuery<UserInfoQuery, UserInfoQueryVariables>(this, () => [
    USER_INFO,
    {
      variables: { id: '1' },
      pollInterval: this.pollInterval,
      onComplete: this.stopPollingOnceLoaded,
    },
  ]);

  // A stable identity, so re-evaluating the thunk does not churn the resource
  // args and obscure what is being tested here.
  stopPollingOnceLoaded = (): void => {
    if (this.userName && this.pollInterval !== 0) {
      this.pollInterval = 0;
    }
  };

  get userName(): string | undefined {
    return this.query.data?.user?.firstName;
  }

  <template><QueryView @query={{this.query}} /></template>
}

module('Integration | Components | query backtracking', function (hooks) {
  setupRenderingTest(hooks);

  test('onComplete may read the resource back and clear tracked state the thunk read', async function (assert) {
    const toggle = new Toggle();

    await render(
      <template>
        <Poller />
        {{#if toggle.showSecond}}
          <Poller />
        {{/if}}
      </template>
    );

    assert.dom('[data-test-id="name"]').exists({ count: 1 });

    // The first query has completed, so the cache is warm. Mounting a second
    // resource makes Apollo Client 4 replay the cached result synchronously
    // from subscribe(), inside setup() -- the same tracking computation the
    // options thunk just read pollInterval in. onComplete then reads the
    // resource back and writes pollInterval, tripping Ember's backtracking
    // assertion.
    toggle.showSecond = true;
    await settled();

    assert.dom('[data-test-id="name"]').exists({ count: 2 });
  });
});

class UserSwitcher {
  @tracked id = '1';
}

class UserPage extends Component<{ Args: { switcher: UserSwitcher } }> {
  query = useQuery<UserInfoQuery, UserInfoQueryVariables>(this, () => [
    USER_INFO,
    { variables: { id: this.args.switcher.id } },
  ]);

  // Reads the data before anything below reads the query, e.g. to fetch the
  // next page once the current one has rendered.
  readData = modifier(() => {
    void this.query.data;
  });

  <template>
    <div {{this.readData}}></div>
    <p
      data-test-id="busy"
      aria-busy={{if this.query.loading "true" "false"}}
    ></p>
    <div data-test-id="name">{{this.query.data.user.firstName}}</div>
  </template>
}

module(
  'Integration | Components | query variables back to a cached result',
  function (hooks) {
    setupRenderingTest(hooks);

    test('switching back to cached variables shows the cached result', async function (assert) {
      const switcher = new UserSwitcher();

      await render(<template><UserPage @switcher={{switcher}} /></template>);
      assert.dom('[data-test-id="name"]').hasText('Cathaline');

      switcher.id = '2';
      await settled();
      assert.dom('[data-test-id="name"]').hasText('Joth');

      // User 1 is cached, so Apollo Client 4 replays it synchronously from
      // subscribe(), inside the update() that the aria-busy read triggers --
      // after the modifier above has already used `data` in this render.
      switcher.id = '1';
      await settled();
      assert.dom('[data-test-id="name"]').hasText('Cathaline');
    });
  }
);
