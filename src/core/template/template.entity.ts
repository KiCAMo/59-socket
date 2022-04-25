import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('msg_template')
export class Template {
  @PrimaryGeneratedColumn()
  template_seq: number;

  @Column()
  template_sitenames: string;

  @Column()
  template_regstamp: string;

  @Column()
  template_regdatetime: Date;

  @Column()
  template_author: number;

  @Column({ type: 'text' })
  template_subject: string;

  @Column({ type: 'text' })
  template_content: string;

  @Column({
    type: 'enum',
    enum: ['사용', '중지'],
    default: '사용',
  })
  template_status: string;
}
