import { stripIndent } from 'common-tags';
import rule from '../../src/rules/prefer-async-pipe';
import { ruleTester } from '../utils';
import { fromFixture } from '../utils/from-fixture';

ruleTester({ types: true }).run('prefer-async-pipe', rule, {
  valid: [
    stripIndent`
      // async pipe
      import { of } from "rxjs";
      @Component({
        selector: "some-component",
        template: "<span>{{ something | async }}</span>"
      })
      class SomeComponent {
        something = of("foo");
      }
    `,
  ],
  invalid: [
    fromFixture(
      stripIndent`
        // subscribe
        import { of } from "rxjs";
        @Component({
          selector: "some-component",
          template: "<span>{{ something }}</span>"
        })
        class SomeComponent implements OnInit {
          something: string;
          ngOnInit() {
            of("foo").subscribe(value => this.something = value);
                      ~~~~~~~~~ [forbidden]
          }
        }
      `,
    ),
  ],
});
