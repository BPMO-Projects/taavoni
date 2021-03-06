import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../shared/services/api.service';
import { UserType } from '../shared/types/user';
import { PasswordType } from '../shared/types/password';
import { ClaimType } from '../shared/types/claim';

@Component({
  selector: 'app-user-admin',
  templateUrl: './user-admin.component.html',
  styleUrls: ['./user-admin.component.css']
})
export class UserAdminComponent implements OnInit {

  constructor(private toastr: ToastrService, private apiService: ApiService) { }

  user: UserType = {};
  passwordObject: PasswordType = {};
  errorMessage: string = null;

  username: string;
  codeMelli: string;
  claimList: ClaimType[];

  ngOnInit() {
    this.getClaimList();
  }

  saveChanges() {
    this.apiService.updateUserById(this.user, this.user._id)
      .subscribe((data) => {
        this.toastr.success('تغییرات با موفقیت ثبت گردید');
      },
        (error) => {
          console.log(error);
          this.toastr.error('خطا در ثبت تغییرات پروفایل کاربر');
        });
  }

  changePass() {
    const userUpdate: UserType = {};
    userUpdate.password = this.passwordObject.newPassword;
    this.apiService.updateUserPassById(userUpdate, this.user._id, this.passwordObject.oldPassword)
      .subscribe((data) => {
        this.toastr.success('کلمه عبور با موفقیت تغییر یافت');
      },
        (err) => {
          console.log(err);
          this.toastr.error(err.error);
        });
  }

  async findUser() {
    if (this.username) {
      const user = await this.apiService.getUserByUsernameAsync(this.username);
      if (user.length > 0) {
        this.user = user[0];
        this.claimList = await this.getClaimListAsync();
        // حذف کلیم هایی که کاربر دارد از لیست کلیم ها
        this.filterClaimList();
      } else {
        this.user = {};
        this.toastr.info('کاربری با این مشخصات پیدا نشد');
        this.claimList = await this.getClaimListAsync();
      }

    } else if (this.codeMelli) {
      const user = await this.apiService.getUserByCodeMelliAsync(this.codeMelli);
      if (user.length > 0) {
        this.user = user[0];
        this.claimList = await this.getClaimListAsync();
        // حذف کلیم هایی که کاربر دارد از لیست کلیم ها
        this.filterClaimList();
      } else {
        this.user = {};
        this.toastr.info('کاربری با این مشخصات پیدا نشد');
        this.claimList = await this.getClaimListAsync();
      }
    }
  }

  usernameChange() {
    this.codeMelli = '';
  }

  codeMelliChange() {
    this.username = '';
  }

  addClaimToUser(id) {
    if (this.user) {
      // push claim to userclaims
      const claimItem = this.claimList.find((claimObject) => claimObject._id === id);
      this.user.claims.push(claimItem);
      // slice claim from claimList
      // tslint:disable-next-line:no-shadowed-variable
      this.claimList = this.claimList.filter(function (claimItem) {
        return claimItem._id !== id;
      });
      // update user record on database
      this.apiService.updateUserById(this.user, this.user._id)
        .subscribe(
          (newUser) => {

          },
          (error) => {
            console.log(error);
            this.toastr.error('خطا در ثبت تغییرات دسترسی کاربر در پایگاه داده');
          }
        );
    }
  }

  removeClaimFromUser(id) {
    // add to claimLIst
    const claimItem = this.user.claims.find((claimObject) => claimObject._id === id);
    this.claimList.push(claimItem);
    // remove from user claims
    // tslint:disable-next-line:no-shadowed-variable
    this.user.claims = this.user.claims.filter(function (claimItem) {
      return claimItem._id !== id;
    });

    // update user record on database
    this.apiService.updateUserById(this.user, this.user._id)
      .subscribe(
        (newUser) => {

        },
        (error) => {
          console.log(error);
          this.toastr.error('خطا در ثبت تغییرات دسترسی کاربر در پایگاه داده');
        }
      );
  }


  filterClaimList() {
    this.claimList = this.claimList.filter((claim) => {
      if (this.user) {
        const userClaim = this.user.claims.find((claimObject) => claimObject._id === claim._id);
        if (userClaim) { return false; } else { return true; }
      } else { return true; }
    });
  }

  getClaimList() {
    this.apiService.getClaimList()
      .subscribe(
        (data) => {
          this.claimList = data;
        },
        (error) => {
          console.log(error);
          this.toastr.error('خطا در بازیابی لیست دسترسی های کاربر');
        }
      );
  }

  async getClaimListAsync() {
    const asyncResult = await this.apiService.getClaimList().toPromise();
    return asyncResult;
  }
}
