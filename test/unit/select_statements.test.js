/**
 * Module dependencies.
 */

var expect = require('expect.js');
var Statements = require('../../lib/fast_legs/statements');

/**
 * Statements test.
 */

var model = {
  tableName:  'model_name',
  primaryKey: 'index',
  _fields: [
    { 'column_name': 'index' },
    { 'column_name': 'name' },
    { 'column_name': 'email' },
    { 'column_name': 'age' },
    { 'column_name': 'field' }
  ]
};

describe('Select statements', function() { 
  it('single primary key', function(done) {
    expect(Statements.select(model, '2345', {}, [])).to.be(
      "SELECT * FROM \"model_name\" WHERE index = '2345';"
    );
    
    done();
  });

  it('multiple primary keys', function() { 
    expect(Statements.select(model, ['1234', '5678'], {}, [])).to.be(
      "SELECT * FROM \"model_name\" WHERE index IN ($1,$2);"
    );
  });

  it('single field', function() {
    expect(Statements.select(model, {'name': 'awesome sauce'}, {}, [])).to.be(
      "SELECT * FROM \"model_name\" WHERE name = $1;"
    );
  });
  
  it('multiple fields', function() {
    expect(
      Statements.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {}, [])).to.be(
      "SELECT * FROM \"model_name\" WHERE name = $1 AND email = $2;"
    );
  });

  it('only option', function() {
    expect(
      Statements.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {
        only: ['index', 'email']
      }, [])).to.be(
      "SELECT index,email FROM \"model_name\" WHERE name = $1 AND email = $2;"
    );
  });

  it('limit', function() {
    expect(Statements.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {
        only: ['index', 'email'],
        limit: 25
      }, [])).to.be(
      "SELECT index,email FROM \"model_name\" WHERE name = $1 AND email = $2 " +
      "LIMIT 25;"
    );
  });

  it('offset', function() {
    expect(Statements.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {
        only: ['index', 'email'],
        offset: 5
      }, [])).to.be(
      "SELECT index,email FROM \"model_name\" WHERE name = $1 AND email = $2 " +
      "OFFSET 5;"
    );
  });

  it('order asc', function() {
    expect(Statements.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {
        only: ['index', 'email'],
        limit: 50,
        order: ['field']
      }, [])).to.be(
      "SELECT index,email FROM \"model_name\" WHERE name = $1 AND email = $2 " +
      "ORDER BY \"field\" ASC LIMIT 50;"
    );
  });

  it('order desc', function() {
    expect(Statements.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {
        only: ['index', 'email'],
        limit: 50,
        order: ['-field']
      }, [])).to.be(
      "SELECT index,email FROM \"model_name\" WHERE name = $1 AND email = $2 " +
      "ORDER BY \"field\" DESC LIMIT 50;"
    );
  });

  it('order, offset & limit', function() {
    expect(Statements.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {
        only: ['index', 'email'],
        offset: 5,
        limit: 50,
        order: ['-field']
      }, [])).to.be(
      "SELECT index,email FROM \"model_name\" WHERE name = $1 AND email = $2 " +
      "ORDER BY \"field\" DESC LIMIT 50 OFFSET 5;"
    );
  });

  it('multiple order fields', function() {
    expect(Statements.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {
        only: ['index', 'email'],
        limit: 50,
        order: ['-field', 'another_field']
      }, [])).to.be(
      "SELECT index,email FROM \"model_name\" WHERE name = $1 AND email = $2 " +
      "ORDER BY \"field\" DESC, \"another_field\" ASC LIMIT 50;"
    );
  });

  it('not equals (ne, not)', function() {
    expect(Statements.select(model, { 'name.ne': 'awesome sauce' }, {}, []))
      .to.be("SELECT * FROM \"model_name\" WHERE name <> $1;");
    expect(Statements.select(model, { 'name.not': 'awesome sauce' }, {}, []))
      .to.be("SELECT * FROM \"model_name\" WHERE name <> $1;");
  });

  it('greater than (gt)', function() {
    expect(Statements.select(model, { 'age.gt': 21 }, {}, []))
      .to.be("SELECT * FROM \"model_name\" WHERE age > $1;");
  });

  it('less than (lt)', function() {
    expect(Statements.select(model, { 'age.lt': 21 }, {}, []))
      .to.be("SELECT * FROM \"model_name\" WHERE age < $1;");
  });

  it('greater than or equal (gte)', function() {
    expect(Statements.select(model, { 'age.gte': 21 }, {}, []))
      .to.be("SELECT * FROM \"model_name\" WHERE age >= $1;");
  });

  it('less than or equal (lte)', function() {
    expect(Statements.select(model, { 'age.lte': 21 }, {}, []))
      .to.be("SELECT * FROM \"model_name\" WHERE age <= $1;");
  });

  it('like (like)', function() {
    expect(Statements.select(model, { 'name.like': '%John%' }, {}, []))
      .to.be("SELECT * FROM \"model_name\" WHERE name LIKE $1;");
  });

  it('not like (nlike, not_like)', function() {
    expect(Statements.select(model, { 'name.nlike': '%John%'}, {}, []))
      .to.be("SELECT * FROM \"model_name\" WHERE name NOT LIKE $1;");
    expect(Statements.select(model, { 'name.not_like': '%John%' }, {}, []))
      .to.be("SELECT * FROM \"model_name\" WHERE name NOT LIKE $1;");
  });

  it('case insensitive like (ilike)', function() {
    expect(Statements.select(model, { 'name.ilike': '%john%' }, {}, []))
      .to.be("SELECT * FROM \"model_name\" WHERE name ILIKE $1;");
  });

  it('not case insensitive like (nilike, not_ilike)', function() {
    expect(Statements.select(model, { 'name.nilike': '%john%' }, {}, []))
      .to.be("SELECT * FROM \"model_name\" WHERE name NOT ILIKE $1;");
    expect(Statements.select(model, { 'name.not_ilike': '%john%' }, {}, []))
      .to.be("SELECT * FROM \"model_name\" WHERE name NOT ILIKE $1;");
  });

  it('in a list of values (in)', function() {
    expect(Statements.select(model, { 'field.in': ['some name'] }, {}, []))
      .to.be("SELECT * FROM \"model_name\" WHERE field IN ($1);");
    expect(Statements.select(model, { 'field.in': ['some name', 34] }, {}, []))
      .to.be("SELECT * FROM \"model_name\" WHERE field IN ($1,$2);");
  });

  it('not in a list of values (nin, not_in)', function() {
    expect(Statements.select(model, { 'field.nin': ['some name'] }, {}, []))
      .to.be("SELECT * FROM \"model_name\" WHERE field NOT IN ($1);");
    expect(Statements.select(model, { 'field.nin': ['some name', 34] }, {}, []))
      .to.be("SELECT * FROM \"model_name\" WHERE field NOT IN ($1,$2);");
    expect(Statements.select(model, { 'field.not_in': ['some name', 34] }, {}, []))
      .to.be("SELECT * FROM \"model_name\" WHERE field NOT IN ($1,$2);");
  });

  it('simple or', function() {
    expect(Statements.select(model, { '$or': { 'field.equals': 'hi', 'age.equals': 18 } }, {}, []))
      .to.be("SELECT * FROM \"model_name\" WHERE (field = $1 OR age = $2);");
  })

  it('complex or', function() {
    expect(Statements.select(model, { 
      'name.equals': 'John',
      '$or': { 'field.equals': 'hi', 'age.equals': 18, 'index.gt': 42 },
      'email.ne': 'josef@yahoo.com'
    }, {}, []))
      .to.be("SELECT * FROM \"model_name\" WHERE name = $1 AND (field = $2 OR age = $3 OR index > $4) AND email <> $5;");
  })

  it('ignores invalid fields', function() {
    expect(Statements.select(model, { 
        'field.in': ['some name', 34], 
        'bad_field': 1234      
      }, {}, [])).to.be(
      "SELECT * FROM \"model_name\" WHERE field IN ($1,$2);"
    );
  });

  it('returns empty with all invalid fields', function() {
    expect(Statements.select(model, { 'bad_field': 1234 }, {}))
      .to.be("SELECT * FROM \"model_name\" WHERE INVALID;");
  });

  it('column alias', function() {
    expect(Statements.select(model, '2345', {only: {'index':'a', 'email':'b'}}))
      .to.be(
      "SELECT index AS \"a\", email AS \"b\" FROM \"model_name\" " +
      "WHERE index = '2345';"
    )
  });

  it('column alias ignores invalid fields', function() {
    expect(Statements.select(model, '2345', {
        only: {'index':'a', 'email':'b', 'bad_field':'c', 'bad_field_2':'d'}
      })).to.be(
      "SELECT index AS \"a\", email AS \"b\" FROM \"model_name\" " +
      "WHERE index = '2345';"
    );
  });

  it('column alias all invalid fields returns all fields', function() {
    expect(Statements.select(model, '2345', {
        only: {'bad_field':'c', 'bad_field_2':'d'}
      })).to.be("SELECT * FROM \"model_name\" WHERE index = '2345';");
  });

  it('column alias with order alias', function() {
    expect(Statements.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {
        only: {'index':'an index', 'email':'a email'},
        limit: 50,
        order: ['-an index', 'a email']
      }, [])).to.be(
      "SELECT index AS \"an index\", email AS \"a email\" FROM \"model_name\" " +
      "WHERE name = $1 AND email = $2 " +
      "ORDER BY \"an index\" DESC, \"a email\" ASC " +
      "LIMIT 50;"
    );
  });
  
  it('query using null', function() {
    expect(Statements.select(model, { 'name': null }, {}, []))
      .to.be("SELECT * FROM \"model_name\" WHERE name IS NULL;");
  });
  
  it('text search query', function() {
    expect(Statements.select(model, { 'name.textsearch': 'test' }, {}, []))
      .to.be("SELECT * FROM \"model_name\" " +
        "WHERE to_tsvector('english', name) @@ to_tsquery('english', $1);"
    );
  });
})

