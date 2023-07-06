import React from 'react';
import { NavLink } from 'react-router-dom';
import { getLoggedInUser } from '../state/authSlice';
import { useSelector } from 'react-redux';

export function Navbar() {

  const user = useSelector(getLoggedInUser);

  return (
    <div className='nav'>
      <nav className='navbar'>
        <ul className="navbar-menu">
          <>
            <li>
              <NavLink to="/">Főoldal</NavLink>
            </li>
            {!user && (
              <>
                <li>
                  <NavLink to="/register">Regisztráció</NavLink>
                </li>
                <li>
                  <NavLink to="/login">Bejelentkezés</NavLink>
                </li>
              </>
            )}

          </>
          {user && (
            <>
              <li>
                <NavLink to="/surveys">Kérdőíveim</NavLink>
              </li>
              <li>
                <NavLink to="/new-survey">Új kérdőív</NavLink>
              </li>
              <li>
                <NavLink to="/profile">Profil</NavLink>
              </li>
              <li>
                <NavLink to="/logout">Kijelentkezés</NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </div>
  );
}

export default Navbar;
