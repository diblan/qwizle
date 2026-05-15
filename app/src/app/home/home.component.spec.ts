import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
  });

  it('renders the home hero and quiz mode cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('Qwizle');
    expect(compiled.textContent).toContain('A daily quiz game for testing your knowledge.');
    expect(compiled.textContent).toContain('Start quiz');
    expect(compiled.textContent).toContain('How it works');
    expect(compiled.textContent).toContain('Classic Quiz');
    expect(compiled.textContent).toContain('Daily Challenge');
    expect(compiled.textContent).toContain('Streak Mode');
  });
});
