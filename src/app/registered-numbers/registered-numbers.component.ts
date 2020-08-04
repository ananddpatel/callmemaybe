import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegisteredNumber } from '../models/models';
import { NumberService } from '../services/number.service';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-registered-numbers',
  templateUrl: './registered-numbers.component.html',
  styleUrls: ['./registered-numbers.component.scss'],
})
export class RegisteredNumbersComponent implements OnInit {
  f: FormGroup;
  closeResult = '';

  editNumberForm: FormGroup;

  currentlyActioning: RegisteredNumber;

  constructor(
    private fb: FormBuilder,
    public numberService: NumberService,
    private modalService: NgbModal
  ) {
    this.f = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(25)]],
      phoneNum: [
        '',
        [
          Validators.required,
          Validators.maxLength(12),
          Validators.pattern(new RegExp('^\\+?[0-9]{11}')),
        ],
      ],
    });
  }

  ngOnInit(): void {}

  async addNumber() {
    const value: RegisteredNumber = this.f.value;
    try {
      const registered = await this.numberService.registerNumber(value);
      console.log(registered);
      this.f.reset();
    } catch (error) {
      console.error(error);
    }
  }
  open(modal, registeredNumber: RegisteredNumber) {
    this.currentlyActioning = { ...registeredNumber };
    this.createEditForm(registeredNumber);
    this.modalService
      .open(modal, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.currentlyActioning = null;
        },
        (reason) => {}
      );
  }
  private createEditForm(registeredNumber: RegisteredNumber) {
    this.editNumberForm = this.fb.group({
      title: [
        registeredNumber.title,
        [Validators.required, Validators.maxLength(25)],
      ],
      phoneNum: [
        {
          value: registeredNumber.phoneNum,
          disabled: registeredNumber.verified,
        },
        [
          Validators.required,
          Validators.maxLength(12),
          Validators.pattern(new RegExp('^\\+?[0-9]{11}')),
        ],
      ],
    });
  }

  async saveEditNumber(modal: any) {
    if (!this.editNumberForm.valid) {
      throw new Error('form not valid');
    }
    let update: Partial<RegisteredNumber>;
    const formVal = this.editNumberForm.value;

    // only verified numbers should be editable
    // this will make sure someone just doesnt edit the html disabled attr to edit the field
    if (this.currentlyActioning.verified) {
      update = { title: formVal.title };
    } else {
      update = { title: formVal.title, phoneNum: formVal.phoneNum };
    }
    const result = await this.numberService.updatePhoneNum(
      update,
      this.currentlyActioning
    );
    console.log('updateresult', result);
    modal.close('Save click');
    this.currentlyActioning = null;
    this.editNumberForm = null;
  }

  async deleteNumber(modal: any) {
    await this.numberService.deleteNumber(this.currentlyActioning);
    console.log(this.currentlyActioning);
    modal.close('Yes click');
  }
}
