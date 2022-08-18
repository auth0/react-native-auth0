/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import Auth0Provider from '../auth0-provider';
import useAuth0 from '../use-auth0';

describe('The Auth0 provider', () => {
  it('renders without error', () => {
    render(
      <Auth0Provider domain="DOMAIN" clientId="CLIENT ID">
        <h1>Hello, world</h1>
      </Auth0Provider>,
    );
  });

  it('provides the useAuth0 hook', () => {
    const Component = () => {
      const {isLoading} = useAuth0();
      return <>Loading: {isLoading.toString()}</>;
    };

    render(
      <Auth0Provider domain="DOMAIN" clientId="CLIENT ID">
        <Component />
      </Auth0Provider>,
    );

    expect(screen.getByText('Loading: true')).toBeInTheDocument();
  });
});
