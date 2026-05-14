import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { AuthService } from '../auth/auth.service';
import { MemberHomeComponent } from './member-home.component';

describe('MemberHomeComponent', () => {
  let fixture: ComponentFixture<MemberHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberHomeComponent],
      providers: [
        { provide: AuthService, useValue: { user: signal({ id: 1, email: 'learner@qwizle.test', displayName: 'Demo Learner' }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberHomeComponent);
    fixture.detectChanges();
  });

  it('greets the logged-in learner', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Good to see you, Demo Learner.');
  });
});
