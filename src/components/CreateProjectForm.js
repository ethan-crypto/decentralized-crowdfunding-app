import React, { Component } from 'react'
import { Field, reduxForm } from 'redux-form'
import { imageFileCaptured } from '../store/actions'


const required = value => (value || typeof value === 'number' ? undefined : 'Required')
const maxDays = max => value => 
	value && value > max ? `Project must be no more than ${max} days long` : undefined
const maxDays60 = maxDays(60)
const greaterThan0 = value => 
	value && value <= 0 ? 'Must be greater than 0' : undefined



const renderInputField = ({
  input,
  placeholder,
  label,
  type,
  meta: { touched, error }
}) => (
  <div>
    <label>{label}</label>
    <div>
      <input {...input} placeholder={placeholder} type={type} />
      {touched && (error && <span>{error}</span>)}
    </div>
  </div>
)

const renderTextareaField = ({
  textarea,
  input,
  placeholder,
  label,
  type,
  meta: { touched, error }
}) => (
  <div>
    <label>{label}</label>
    <div>
      <textarea {...input} placeholder={placeholder} type={type} />
      {touched && (error && <span>{error}</span>)}
    </div>
  </div>
)

const captureFile = dispatch => event => {
  event.preventDefault()
  const file = event.target.files[0]
  console.log(typeof file)
  if(typeof file !== 'undefined') {
  	const reader = new window.FileReader()
  	reader.readAsArrayBuffer(file)

	  reader.onloadend = () => {
	    dispatch(imageFileCaptured(Buffer(reader.result))) 
	    console.log(Buffer(reader.result))
	  }
  }
  else {
  	dispatch(imageFileCaptured(null))
  }

}




class createProjectForm extends Component {

	render() {
		const { dispatch, handleSubmit, pristine, reset, submitting } = this.props
		
		return (
	    <form onSubmit={handleSubmit}>
		    <div>
	        <label>Image</label>
	        <div>
	        	<input type='file' accept=".jpg, .jpeg, .png, .bmp, .gif, ''" onChange={captureFile(dispatch)} />
	        </div>
	      </div>
	      <Field
	        name="name"
	        type="text"
	        component={renderInputField}
	        label="Name"
	        validate = {[required]}
	      />
	      <Field
	        name="fundGoal"
	        type="number"
	        component={renderInputField}
	        label="Funding Goal"
	        placeholder = "DAI"
	        validate = {[required, greaterThan0]}
	      />
	      <Field
	        name="timeGoal"
	        type="number"
	        component={renderInputField}
	        label="Time Goal"
	        placeholder = "Days"
	        validate = {[required, greaterThan0, maxDays60]}
	      />
	      <Field 
	      	name="description"
	      	type="text"
	      	component={renderTextareaField}
	      	label="Description"
	      	validate = {[required]}
	      />
	      <div>
	        <button type="submit" disabled={submitting}>
	          Submit
	        </button>
	        <button type="button" disabled={pristine || submitting} onClick={reset}>
	          Clear Values
	        </button>
	      </div>
	    </form>
	  )	
	}
  
}


export default reduxForm({ form: 'project' })(createProjectForm)