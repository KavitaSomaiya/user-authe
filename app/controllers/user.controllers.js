
// const express = require('express')
// const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')
const keys = require('../../config/keys')
const User = require('../models/user.models')

// Create and Save a new User
exports.create = (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body)
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors)
  }
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" })
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        password2: req.body.password2
      })
    
      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err
          newUser.password = hash
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password2, salt, (err, hash2) => {
              if (err) throw err
              newUser.password2 = hash2
              newUser
              .save()
              .then(user => res.send(user))
              .catch(err => console.log(err))
            })
          })
        })
      })
    }
  })
}

// Retrieve and return all products from the database.
exports.findAll = (req, res) => {
  User.find()
    .then(users => {
      res.send(users)
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || 'Some error occured while retrieving users.'
      })
    })
}

exports.findOne = (req, res) => {
  // Form validation
  const { errors, isValid } = validateLoginInput(req.body)
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors)
  }
  const email = req.body.email
  const password = req.body.password
  // Find user by email
  User.findOne({ email }).then(user => {
    // Check if user exists
    if (!user) {
      // errors.email = "Email is already taken"
      return res.status(404).json({ emailnotfound: "Email not found" })
    }
    // Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          _id: user._id,
          name: user.name
        }
        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 31556926 // 1 year in seconds
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            })
          }
        )
      } else {
        return res
        .status(400)
        .json({ passwordincorrect: "Password incorrect" })
      }
    })
  })
}

exports.findByUserId = (req, res) => {
  User.findById(req.params.userId)
  .then(user => {
    if (!user) {
      return res.status(404).send({
        message: 'User not found with ID ' + req.params.userId
      })
    }
    res.send(user)
  })
  .catch(err => {
    if (err.king === 'ObjectId') {
      return res.status(404).send({
        message: 'User not found with ID ' + req.params.userId
      })
    }
    return res.status(500).send({
      message: 'Error retrieving user with ID ' + req.params.userId
    })
  })
}

exports.update = (req, res) => {
  console.log(req.body)
  if(!req.body) {
      return res.status(400).send({
          message: "User content can not be empty"
      })
  }
  User.findByIdAndUpdate(req.params.userId, {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    password2: req.body.password2
  }, {new: true})
  .then(user => {
      if(!user) {
          return res.status(404).send({
              message: "User not found with ID " + req.params.userId
          })
      }
      res.send(user);
  }).catch(err => {
      if(err.kind === 'ObjectId') {
          return res.status(404).send({
              message: "User not found with ID " + req.params.userId
          })           
      }
      return res.status(500).send({
          message: "Error updating user with ID " + req.params.userId
      })
  })
}

exports.delete = (req, res) => {
  User.findByIdAndRemove(req.params.userId)
  .then(user => {
      if(!user) {
          return res.status(404).send({
              message: "User not found with id " + req.params.userId
          })
      }
      res.send({message: "User deleted successfully!"})
  }).catch(err => {
      if(err.kind === 'ObjectId' || err.name === 'NotFound') {
          return res.status(404).send({
              message: "User not found with id " + req.params.userId
          })
      }
      return res.status(500).send({
          message: "Could not delete user with id " + req.params.userId
      })
  })
}