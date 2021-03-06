import { BehaviorSubject } from 'rxjs';

import config from 'config';
import { handleResponse } from '@/_helpers';

const currentUserSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('currentUser')));

export const authenticationService = {
    login,
    signup,
    logout,
    currentUser: currentUserSubject.asObservable(),
    get currentUserValue () { return currentUserSubject.value }
};

function signup(userName, email, password) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, email, password })
    };

    return fetch(`${config.apiUrl}/api/auth/signup`, requestOptions)
    .then(user => {

        return login(email, password);
    });
    // .then(handleResponse)
    // .then(user => {
    //     // store user details and jwt token in local storage to keep user logged in between page refreshes
    //     // localStorage.setItem('currentUser', JSON.stringify(user));
    //     console.log('currentUser', JSON.stringify(user));

    //     currentUserSubject.next(user);

    //     return user;
    // });
}

function login(email, password) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    };

    return fetch(`${config.apiUrl}/api/auth/signin`, requestOptions)
        .then(handleResponse)
        .then(user => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('currentUser', JSON.stringify(user));

            currentUserSubject.next(user);

            return user;
        });
}

function logout() {

    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    currentUserSubject.next(null);
}
