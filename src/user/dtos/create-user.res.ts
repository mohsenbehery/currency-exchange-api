import { Expose, Transform } from 'class-transformer';

export class SignUpResDto {
  @Expose()
  @Transform((value) => value.obj._id.toString())
  _id: any;

  @Expose()
  username: string;

  @Expose()
  email: string;
}
