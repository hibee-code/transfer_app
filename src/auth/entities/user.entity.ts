import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar' })
  passwordHash: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ unique: true })
  bankAccountNumber: string;

  @Column({ type: 'varchar', nullable: true })
  transactionPinHash?: string;

  @Column({ nullable: true })
  passwordResetToken?: string;

  @Column({ nullable: true })
  pinResetToken?: string;
}
