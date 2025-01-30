import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
// import { BankAccount } from '../../bank-accounts/entities/bank-account.entity';
// import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

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

  // @OneToMany(() => BankAccount, (account) => account.user)
  // accounts: BankAccount[];

  // @OneToMany(() => Transaction, (transaction) => transaction.user)
  // transactions: Transaction[];
}
