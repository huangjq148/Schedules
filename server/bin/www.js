const Koa = require('koa');
const app = new Koa();





app.use(async ctx => {
  const xlsx = require('node-xlsx').default;
  const filename = "aaa.xls"
  // Or var xlsx = require('node-xlsx').default;

  const data = [
    [1, 2, 3],
    [true, false, null, 'sheetjs'],
    ['foo', 'bar', new Date('2014-02-19T14:30Z'), '0.3'],
    ['baz', null, 'qux'],
  ];
  var buffer = xlsx.build([{ name: 'mySheetName', data: data }]);
  ctx.append(
    "Content-Disposition",
    "attachment; filename=" + filename
  );
  ctx.body = buffer;
});

app.listen(8080);