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
