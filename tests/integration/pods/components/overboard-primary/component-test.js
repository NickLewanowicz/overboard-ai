import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('overboard-primary', 'Integration | Component | overboard primary', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{overboard-primary}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#overboard-primary}}
      template block text
    {{/overboard-primary}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
