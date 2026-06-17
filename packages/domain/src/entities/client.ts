import { ClientValidationError } from '../errors/index.js';
import type { ClientProps } from './client.types.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Client {
  readonly id: string;
  readonly name: string;
  readonly email: string;

  private constructor(props: ClientProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
  }

  static create(props: ClientProps): Client {
    if (!props.id?.trim()) {
      throw new ClientValidationError('Client id is required');
    }
    if (!props.name?.trim()) {
      throw new ClientValidationError('Client name is required');
    }
    if (!props.email?.trim()) {
      throw new ClientValidationError('Client email is required');
    }
    if (!EMAIL_REGEX.test(props.email.trim())) {
      throw new ClientValidationError('Client email format is invalid');
    }
    return new Client({
      id: props.id.trim(),
      name: props.name.trim(),
      email: props.email.trim().toLowerCase(),
    });
  }

  static fromProps(props: ClientProps): Client {
    return Client.create(props);
  }

  toProps(): ClientProps {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
    };
  }
}
