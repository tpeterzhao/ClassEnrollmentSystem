const express = require('express')
const bodyparser = require('body-parser')
const session = require('express-session')
const path = require('path')
const http = require('http')
const fs = require('fs')
const db = require('./db')
const users = require('./users')
const app = express()
const port = 3000

app.use(express.static(path.join(__dirname,'../')))
app.use(bodyparser.json())
app.use(
  bodyparser.urlencoded({
    extended:true,
  })
)
app.use(session({
  secret: 'magic',
  resave: false,
  saveUninitialized: false
}))
app.set('view engine', 'ejs')
app.get('/login', (req, res)=>{
  res.render('login')
})
// use sessions to do login
app.post('/login', async (req,res)=>{
  let username = req.body.username
  let password = req.body.password
  if(username=="" || password==""){
    res.send("Please enter Username and Password.")
    res.end();
    return
  }
  // check if user is student
  const stud = await db.query(
    'SELECT COUNT(1) FROM students WHERE username = $1',[username]
  )
  const prof = await db.query(
    'SELECT COUNT(1) FROM professors WHERE username = $1',[username]
  )
  if(stud[0].count > 0){
    req.session.loggedin = true;
    req.session.username = username;
    return res.redirect('/student')
  }else if(prof[0].count > 0){
    req.session.loggedin = true;
    req.session.username = username;
    return res.redirect('/professor')
  } else{
    res.send("Username does not exist.")
    res.end()
  }
})

app.get('/logout', (req,res)=>{
  req.session.loggedin = false
  req.session.username = null
  res.redirect('/login')
})

//student sign up
app.get('/studentsignup',(req,res)=>{
  res.render('studentSignUp')
})
app.post('/studentsignup', async (req,res)=>{
  let username = req.body.firstname.toLowerCase() + req.body.lastname.toLowerCase()
  const rows = await db.query(
    'INSERT INTO students VALUES ($1, $2, $3, $4, $5)',[username, req.body.firstname, req.body.lastname, req.body.password, req.body.major]
  )
  return res.redirect('/login')
})

//professor sign up
app.get('/teachersignup',(req,res)=>{
  res.render('teacherSignUp')
})
app.post('/teachersignup', async (req,res)=>{
  let username = req.body.firstname.toLowerCase() + req.body.lastname.toLowerCase()
  const rows = await db.query(
    'INSERT INTO professors VALUES ($1, $2, $3, $4, $5, $6)',[username, req.body.firstname, req.body.lastname, req.body.password, req.body.title, req.body.department]
  )
  return res.redirect('/login')
})

// student page
app.get('/student', async (req,res)=>{
  if(!req.session.loggedin){
    return res.redirect('/login')
  }
  let username = req.session.username
  const rows = await db.query(
    'SELECT * FROM students WHERE username = $1',[username]
  )
  const regs = await db.query(
    'SELECT courses.category, courses.code, courses.name, courses.credit_hours FROM register '+
    'RIGHT JOIN courses ON (register.category,register.code)=(courses.category,courses.code) '+
    'WHERE username = $1',[username]
  )
  res.render('Student',{student: rows[0], regs: regs})
})

app.get('/stdCourses', async (req,res)=>{
  if(!req.session.loggedin){
    return res.redirect('/login')
  }
  let username = req.session.username
  const takens = await db.query(
    'SELECT courses.category, courses.code, courses.name, courses.credit_hours, hasTaken.grade FROM hasTaken '+
    'RIGHT JOIN courses ON (hasTaken.category,hasTaken.code)=(courses.category,courses.code) '+
    'WHERE username = $1',[username]
  )
  res.render('stdCourses',{takens: takens})
})


app.get('/professor', async (req,res)=>{
  if(!req.session.loggedin){
    return res.redirect('/login')
  }
  let username = req.session.username
  const rows = await db.query(
    'SELECT * FROM professors WHERE username = $1',[username]
  )
  res.render('Professor',{professor: rows[0]})
})
app.get('/profCourses', async (req,res)=>{
  if(!req.session.loggedin){
    return res.redirect('/login')
  }
  let username = req.session.username
  const teaches = await db.query(
    'SELECT courses.category, courses.code, courses.name, courses.credit_hours FROM teaches '+
    'RIGHT JOIN courses ON (teaches.category,teaches.code)=(courses.category,courses.code) '+
    'WHERE username = $1',[username]
  )

  //TODO: add current student count for each course

  res.render('stdCourses',{teaches: teaches})
})

app.get('/stdAddClass', (req,res)=>{
  if(!req.session.loggedin){
    return res.redirect('/login')
  }
  res.render('stdAddClass')
})
app.post('/stdAddClass', async (req,res)=>{
  if(!req.session.loggedin){
    return res.redirect('/login')
  }
  console.log(req.body.code)
  //TODO: add class for student


  return res.redirect('/student')
})

app.get('/profAddClass', (req,res)=>{
  if(!req.session.loggedin){
    return res.redirect('/login')
  }
  res.render('profAddClass')
})
app.post('/profAddClass', async (req,res)=>{
  if(!req.session.loggedin){
    return res.redirect('/login')
  }
  //TODO: add class for professor

  return res.redirect('/professor')
})


app.listen(port,()=>{
  console.log('running on port: '+port+' .')
})

class User{
  constructor(username, firstname, lastname, password){
    this.username = username
    this.firstname = firstname
    this.lastname = lastname
    this.password = password
  }
}

class Student extends User{
  constructor(username, firstname,lastname,password,major){
    super(username,firstname,lastname,password)
    this.major = major
  }
}

class Professor extends User{
  constructor(username, firstname, lastname, password, title, department){
    super(username,firstname,lastname,password,major)
    this.title = title
    this.department = department
  }
}
