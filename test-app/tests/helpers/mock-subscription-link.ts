/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
// Origianl Implementation: https://github.com/apollographql/apollo-client/blob/main/src/utilities/testing/mocking/mockSubscriptionLink.ts

import { Observable } from '@apollo/client/utilities';
import {
  ApolloLink,
  type FetchResult,
  type Operation,
} from '@apollo/client/core';

export interface MockedSubscription {
  request: Operation;
}

export interface MockedSubscriptionResult {
  result?: FetchResult;
  error?: Error;
  delay?: number;
}

export class MockSubscriptionLink extends ApolloLink {
  unsubscribers: any[] = [];
  setups: any[] = [];
  operation?: Operation;
  private observers: any[] = [];

  request(operation: Operation) {
    this.operation = operation;
    return new Observable<FetchResult>((observer) => {
      this.setups.forEach((x) => x());
      this.observers.push(observer);
      return () => {
        this.unsubscribers.forEach((x) => x());
      };
    });
  }

  simulateResult(result: MockedSubscriptionResult, complete = false) {
    setTimeout(() => {
      const { observers } = this;
      if (!observers.length) throw new Error('subscription torn down');
      observers.forEach((observer) => {
        if (result.result && observer.next) observer.next(result.result);
        if (result.error && observer.error) observer.error(result.error);
        if (complete && observer.complete) observer.complete();
      });
    }, result.delay || 0);
  }

  simulateComplete() {
    const { observers } = this;
    if (!observers.length) throw new Error('subscription torn down');
    observers.forEach((observer) => {
      if (observer.complete) observer.complete();
    });
  }

  onSetup(listener: any): void {
    this.setups = this.setups.concat([listener]);
  }

  onUnsubscribe(listener: any): void {
    this.unsubscribers = this.unsubscribers.concat([listener]);
  }
}
