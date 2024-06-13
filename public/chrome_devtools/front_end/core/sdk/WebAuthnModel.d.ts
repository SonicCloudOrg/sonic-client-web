import type * as Protocol from '../../generated/protocol.js';
import { SDKModel } from './SDKModel.js';
import { type Target } from './Target.js';
export declare const enum Events {
    CredentialAdded = "CredentialAdded",
    CredentialAsserted = "CredentialAsserted"
}
export type EventTypes = {
    [Events.CredentialAdded]: Protocol.WebAuthn.CredentialAddedEvent;
    [Events.CredentialAsserted]: Protocol.WebAuthn.CredentialAssertedEvent;
};
export declare class WebAuthnModel extends SDKModel<EventTypes> {
    #private;
    constructor(target: Target);
    setVirtualAuthEnvEnabled(enable: boolean): Promise<Object>;
    addAuthenticator(options: Protocol.WebAuthn.VirtualAuthenticatorOptions): Promise<Protocol.WebAuthn.AuthenticatorId>;
    removeAuthenticator(authenticatorId: Protocol.WebAuthn.AuthenticatorId): Promise<void>;
    setAutomaticPresenceSimulation(authenticatorId: Protocol.WebAuthn.AuthenticatorId, enabled: boolean): Promise<void>;
    getCredentials(authenticatorId: Protocol.WebAuthn.AuthenticatorId): Promise<Protocol.WebAuthn.Credential[]>;
    removeCredential(authenticatorId: Protocol.WebAuthn.AuthenticatorId, credentialId: string): Promise<void>;
    credentialAdded(params: Protocol.WebAuthn.CredentialAddedEvent): void;
    credentialAsserted(params: Protocol.WebAuthn.CredentialAssertedEvent): void;
}
