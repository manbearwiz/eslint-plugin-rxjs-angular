import { stripIndent } from 'common-tags';
import rule from '../../src/rules/prefer-composition';
import { ruleTester } from '../utils';
import { fromFixture } from '../utils/from-fixture';

ruleTester({ types: true }).run('prefer-composition', rule, {
  valid: [
    {
      code: stripIndent`
        // composed component
        import { Component, OnDestroy, OnInit } from "@angular/core";
        import { of, Subscription } from "rxjs";

        @Component({
          selector: "composed-component",
          template: "<span>{{ value }}</span>"
        })
        export class ComposedComponent implements OnInit, OnDestroy {
          value: string;
          private subscription = new Subscription();
          ngOnInit() {
            this.subscription.add(of("foo").subscribe(value => this.value = value));
          }
          ngOnDestroy() {
            this.subscription.unsubscribe();
          }
        }
      `,
    },
    {
      code: stripIndent`
        // composed component with private JavaScript property
        import { Component, OnDestroy, OnInit } from "@angular/core";
        import { of, Subscription } from "rxjs";

        @Component({
          selector: "composed-component",
          template: "<span>{{ value }}</span>"
        })
        export class ComposedComponent implements OnInit, OnDestroy {
          value: string;
          #subscription = new Subscription();
          ngOnInit() {
            this.#subscription.add(of("foo").subscribe(value => this.value = value));
          }
          ngOnDestroy() {
            this.#subscription.unsubscribe();
          }
        }
      `,
    },
    {
      code: stripIndent`
        // variable composed component
        import { Component, OnDestroy, OnInit } from "@angular/core";
        import { of, Subscription } from "rxjs";

        @Component({
          selector: "variable-composed-component",
          template: "<span>{{ value }}</span>"
        })
        export class VariableComposedComponent implements OnInit, OnDestroy {
          value: string;
          private subscription = new Subscription();
          ngOnInit() {
            let subscription = of("foo").subscribe(value => this.value = value);
            this.subscription.add(subscription);
            subscription = of("bar").subscribe(value => this.value = value);
            this.subscription.add(subscription);
          }
          ngOnDestroy() {
            this.subscription.unsubscribe();
          }
        }
      `,
    },
    {
      code: stripIndent`
        // variable composed component with private JavaScript property
        import { Component, OnDestroy, OnInit } from "@angular/core";
        import { of, Subscription } from "rxjs";

        @Component({
          selector: "variable-composed-component",
          template: "<span>{{ value }}</span>"
        })
        export class VariableComposedComponent implements OnInit, OnDestroy {
          value: string;
          #subscription = new Subscription();
          ngOnInit() {
            let subscription = of("foo").subscribe(value => this.value = value);
            this.#subscription.add(subscription);
            subscription = of("bar").subscribe(value => this.value = value);
            this.#subscription.add(subscription);
          }
          ngOnDestroy() {
            this.#subscription.unsubscribe();
          }
        }
      `,
    },
    {
      code: stripIndent`
        // destructured composed component
        import { Component, OnDestroy, OnInit } from "@angular/core";
        import { of, Subscription } from "rxjs";

        @Component({
          selector: "destructured-composed-component",
          template: "<span>{{ value }}</span>"
        })
        export class DestructuredComposedComponent implements OnInit, OnDestroy {
          value: string;
          private subscription = new Subscription();
          ngOnInit() {
            const { subscription } = this;
            subscription.add(of("foo").subscribe(value => this.value = value));
          }
          ngOnDestroy() {
            const { subscription } = this;
            subscription.unsubscribe();
          }
        }
      `,
    },
    {
      code: stripIndent`
        // composed component with custom subscription class implementing Subscription interface
        import { Component, OnDestroy, OnInit } from "@angular/core";
        import { of } from "rxjs";

        interface Subscription {
          add(subscription: Subscription): Subscription;
          unsubscribe(): void;
        }

        class CustomComposer implements Subscription {
          add(s: Subscription) { return s; }
          unsubscribe() {}
        }

        @Component({
          selector: "custom-subscription-component",
          template: "<span>{{ value }}</span>"
        })
        export class CustomSubscriptionComponent implements OnInit, OnDestroy {
          value: string;
          private subscription = new CustomComposer();
          ngOnInit() {
            this.subscription.add(of("foo").subscribe(value => this.value = value));
          }
          ngOnDestroy() {
            this.subscription.unsubscribe();
          }
        }
      `,
    },
    {
      code: stripIndent`
        // composed component with class extending Subscription
        import { Component, OnDestroy, OnInit } from "@angular/core";
        import { of, Subscription } from "rxjs";

        class ExtendedSubscription extends Subscription {}

        @Component({
          selector: "extended-subscription-component",
          template: "<span>{{ value }}</span>"
        })
        export class ExtendedSubscriptionComponent implements OnInit, OnDestroy {
          value: string;
          private subscription = new ExtendedSubscription();
          ngOnInit() {
            this.subscription.add(of("foo").subscribe(value => this.value = value));
          }
          ngOnDestroy() {
            this.subscription.unsubscribe();
          }
        }
      `,
    },
    {
      code: stripIndent`
        // not a component
        import { of } from "rxjs";

        class SomeClass {
          value: string;
          someMethod() {
            of("foo").subscribe(value => this.value = value);
          }
        }

        function someFunction() {
          of("foo").subscribe(value => this.value = value);
        }
      `,
    },
  ],
  invalid: [
    fromFixture(
      stripIndent`
        // not composed component
        import { Component, OnDestroy, OnInit } from "@angular/core";
        import { of, Subscription } from "rxjs";

        @Component({
          selector: "not-composed-component",
          template: "<span>{{ value }}</span>"
        })
        export class NotComposedComponent implements OnInit, OnDestroy {
          value: string;
          ngOnInit() {
            of("foo").subscribe(value => this.value = value);
                      ~~~~~~~~~ [notComposed]
            const subscription = of("bar").subscribe(value => this.value = value);
                                           ~~~~~~~~~ [notComposed]
          }
          ngOnDestroy() {
          }
        }
      `,
    ),
    fromFixture(
      stripIndent`
        // not unsubscribed component
        import { Component, OnDestroy, OnInit } from "@angular/core";
        import { of, Subscription } from "rxjs";

        @Component({
          selector: "not-unsubscribed-component",
          template: "<span>{{ value }}</span>"
        })
        export class NotUnsubscribedComponent implements OnInit, OnDestroy {
          value: string;
          private subscription = new Subscription();
                  ~~~~~~~~~~~~ [notUnsubscribed]
          ngOnInit() {
            this.subscription.add(of("foo").subscribe(value => this.value = value));
          }
          ngOnDestroy() {
          }
        }
      `,
    ),
    fromFixture(
      stripIndent`
        // not unsubscribed component with private JavaScript property
        import { Component, OnDestroy, OnInit } from "@angular/core";
        import { of, Subscription } from "rxjs";
        @Component({
          selector: "not-unsubscribed-component",
          template: "<span>{{ value }}</span>"
        })
        export class NotUnsubscribedComponent implements OnInit, OnDestroy {
          value: string;
          #subscription = new Subscription();
          ~~~~~~~~~~~~~ [notUnsubscribed]
          ngOnInit() {
            this.#subscription.add(of("foo").subscribe(value => this.value = value));
          }
          ngOnDestroy() {
          }
        }
      `,
    ),
    fromFixture(
      stripIndent`
        // not destroyed component
        import { Component, OnDestroy, OnInit } from "@angular/core";
        import { of, Subscription } from "rxjs";

        @Component({
          selector: "not-destroyed-component",
          template: "<span>{{ value }}</span>"
        })
        export class NotDestroyedComponent implements OnInit {
                     ~~~~~~~~~~~~~~~~~~~~~ [notImplemented]
          value: string;
          private subscription = new Subscription();
          ngOnInit() {
            this.subscription.add(of("foo").subscribe(value => this.value = value));
          }
        }
      `,
    ),
    fromFixture(
      stripIndent`
        // not destroyed component with Private JavaScript property
        import { Component, OnDestroy, OnInit } from "@angular/core";
        import { of, Subscription } from "rxjs";
        @Component({
          selector: "not-destroyed-component",
          template: "<span>{{ value }}</span>"
        })
        export class NotDestroyedComponent implements OnInit {
                     ~~~~~~~~~~~~~~~~~~~~~ [notImplemented]
          value: string;
          #subscription = new Subscription();
          ngOnInit() {
            this.#subscription.add(of("foo").subscribe(value => this.value = value));
          }
        }
      `,
    ),
    fromFixture(
      stripIndent`
        // not declared
        import { Component, OnDestroy, OnInit } from "@angular/core";
        import { of, Subscription } from "rxjs";

        @Component({
          selector: "not-declared-component",
          template: "<span>{{ value }}</span>"
        })
        export class NotDeclaredComponent implements OnInit {
                     ~~~~~~~~~~~~~~~~~~~~ [notDeclared { "name": "subscription" }]
          value: string;
          ngOnInit() {
            const subscription = new Subscription();
            subscription.add(of("foo").subscribe(value => this.value = value));
          }
          ngOnDestroy() {
          }
        }
      `,
    ),
  ],
});
