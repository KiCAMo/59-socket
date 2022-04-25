import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Banks {
  @PrimaryGeneratedColumn()
  banks_seq: number;

  @Column()
  banks_sitenames: string;

  @Column()
  banks_account: string;

  @Column()
  banks_name: string;

  @Column({
    type: 'enum',
    enum: ['사용', '미사용', '숨김'],
    default: 'y',
  })
  banks_status: string;
}
