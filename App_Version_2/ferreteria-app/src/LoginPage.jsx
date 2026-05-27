import LoginForm from './LoginForm'

const LoginPage = ({ onLoginSuccess }) => {
  return (
    <div style={{ maxWidth: '500px', margin: '50px auto' }}>
      <LoginForm onLoginSuccess={onLoginSuccess} />
    </div>
  )
}

export default LoginPage