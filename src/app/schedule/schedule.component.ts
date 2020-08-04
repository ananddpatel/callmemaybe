import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ScheduleService } from '../services/schedule.service';
import { NumberService } from '../services/number.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
})
export class ScheduleComponent implements OnInit {
  addReminderForm: FormGroup;
  constructor(
    private modalService: NgbModal,
    private scheduleService: ScheduleService,
    private fb: FormBuilder,
    public numberService: NumberService
  ) {
    this.addReminderForm = this.fb.group({
      title: ['', Validators.required],
      voiceCallSay: '',
      date: ['', Validators.required],
      time: ['', Validators.required],
      phoneNumber: [
        numberService.verifiedNumbers[0].phoneNum,
        Validators.required,
      ],
    });
  }

  ngOnInit(): void {}

  open(modal) {
    this.modalService
      .open(modal, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {},
        (reason) => {}
      );
  }

  async saveReminder(modal: any) {
    await this.scheduleService.add(this.addReminderForm.value);
    modal.close('saved');
  }
}
