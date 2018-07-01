export default {

    // {{compare unicorns "<" ponies }}
    // 	I knew it, unicorns are just low-quality ponies!
    // {{/compare}}
    //
    // (defaults to === if operator omitted)
    //
    // {{compare unicorns ponies }}
    // 	That's amazing, unicorns are actually undercover ponies
    // {{/equal}}
    // (Source: http://doginthehat.com.au/2012/02/comparison-block-helper-for-handlebars-templates/)
    // NB: Arrow functions are block scoped, so the `this` will not be tied the function
    compare: function(lvalue, operator, rvalue, options) {

        if (arguments.length < 3)
            throw new Error('Handlerbars Helper \'compare\' needs 2 parameters');

        // Transform {{#compare a b}} to =>> `a === b`
        if (options === undefined) {
            options = rvalue;
            rvalue = operator;
            operator = '===';
        }

        var operators = {
            '==': function(l, r) { return l == r; }, // eslint-disable-line eqeqeq
            '===': function(l, r) { return l === r;} ,
            '!=': function(l, r) { return l != r; }, // eslint-disable-line eqeqeq
            '!==': function(l, r) { return l !== r;} ,
            '<': function(l, r) { return l < r;} ,
            '>': function(l, r) { return l > r;} ,
            '<=': function(l, r) { return l <= r;} ,
            '>=': function(l, r) { return l >= r;} ,
            'typeof': function(l, r) { return typeof l === r;} ,
        };

        if (!operators[operator])
            throw new Error('Handlerbars Helper \'compare\' doesn\'t know the operator ' + operator);

        var result = operators[operator](lvalue, rvalue);

        if (result) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },
};
