import { GoogleLogout } from 'react-google-login';

const clientId="100174910445-iebn5m90ehh5fls0ka2qf11753s7ohp4.apps.googleusercontent.com";


function Logout() {
    return(
        <div id="signOutButton">
            <GoogleLogout
                clientId={clientId}
                buttonText={"Logout"}
                 onLogoutSuccess={onSuccess}

            />
        </div>
    )
}

export default Logout;