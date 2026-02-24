const PDFDocument = require('pdfkit');
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Home
router.get('/', (req, res) => {
    db.query("SELECT * FROM employees", (err, employees) => {
        res.render('index', { employees });
    });
});

// Add Employee Page
router.get('/add', (req, res) => {
    res.render('addEmployee');
});

// Save Employee
router.post('/add', (req, res) => {
    const { name, email, basic_salary } = req.body;
    db.query("INSERT INTO employees SET ?", { name, email, basic_salary }, () => {
        res.redirect('/');
    });
});

// Generate Payroll
router.get('/generate/:id', (req, res) => {
    const id = req.params.id;

    db.query("SELECT * FROM employees WHERE id = ?", [id], (err, result) => {
        const emp = result[0];
        const basic = emp.basic_salary;

        // Auto Calculations
        const pf = basic * 0.12;
        const tax = basic * 0.05;

        const net_salary = basic - pf - tax;

        const payrollData = {
            employee_id: id,
            basic,
            pf,
            tax,
            net_salary
        };

        db.query("INSERT INTO payroll SET ?", payrollData, () => {
            res.render('payroll', { emp, payrollData });
        });
    });
});

// Delete Employee
router.get('/delete/:id', (req, res) => {
    const id = req.params.id;

    db.query("DELETE FROM payroll WHERE employee_id = ?", [id], () => {
        db.query("DELETE FROM employees WHERE id = ?", [id], () => {
            res.redirect('/');
        });
    });
});
// Download PDF Payslip
router.get('/payslip/pdf/:id', (req, res) => {
    const id = req.params.id;

    db.query("SELECT * FROM employees WHERE id = ?", [id], (err, empResult) => {

        const emp = empResult[0];
        const basic = emp.basic_salary;

        const pf = basic * 0.12;
        const tax = basic * 0.05;

        const net_salary = basic - pf - tax;

        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=payslip_${emp.name}.pdf`
        );

        doc.pipe(res);

        doc.fontSize(20).text('Employee Payslip', { align: 'center' });
        doc.moveDown();

        doc.fontSize(14).text(`Name: ${emp.name}`);
        doc.text(`Email: ${emp.email}`);
        doc.moveDown();

        doc.text(`Basic Salary: ₹${basic}`);
        doc.text(`PF (12%): ₹${pf}`);
        doc.text(`Tax (5%): ₹${tax}`);
        doc.moveDown();

        doc.fontSize(16).text(`Net Salary: ₹${net_salary}`, {
            underline: true
        });

        doc.end();
    });
});

module.exports = router;

