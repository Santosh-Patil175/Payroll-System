const express = require('express');
const bodyParser = require('body-parser');
const payrollRoutes = require('./routes/payroll');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use('/', payrollRoutes);

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});