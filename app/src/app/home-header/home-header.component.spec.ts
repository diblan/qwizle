import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HomeHeaderComponent } from './home-header.component';

describe('HomeHeaderComponent', () => {
  let fixture: ComponentFixture<HomeHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeHeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeHeaderComponent);
    fixture.detectChanges();
  });

  it('renders centered brand and signed-out dropdown options', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.home-header__brand')?.textContent).toContain('Qwizle');
    expect(compiled.textContent).toContain('Settings');
    expect(compiled.textContent).toContain('Theme');
    expect(compiled.textContent).toContain('Sound');
    expect(compiled.textContent).toContain('Language');
    expect(compiled.textContent).toContain('Sign in');
    expect(compiled.textContent).toContain('Continue anonymously');
  });

  it('toggles one dropdown menu at a time', () => {
    const component = fixture.componentInstance;

    component.toggleMenu('settings');
    expect(component.isOpen('settings')).toBeTrue();
    expect(component.isOpen('account')).toBeFalse();

    component.toggleMenu('account');
    expect(component.isOpen('settings')).toBeFalse();
    expect(component.isOpen('account')).toBeTrue();
  });
});
