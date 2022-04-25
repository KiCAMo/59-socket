import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Sites {
  @PrimaryGeneratedColumn()
  sites_seq: number;

  @Column()
  sites_name: string;

  @Column()
  sites_settings: number;
}
